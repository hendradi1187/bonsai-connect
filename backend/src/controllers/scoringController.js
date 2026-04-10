const { Scoring, Participant, Bonsai } = require('../models');
const { getIO } = require('../websocket/handlers');
const { calculateTotalScore, getRankingData } = require('../services/rankingService');
const { assertParticipantAccess, getAssignedEventIds } = require('../services/accessScope');
const { createAuditLog } = require('../services/auditService');
const { formatQueueEntry, getCurrentQueueEntry, getQueueEntries, getQueueStats, markQueueEntryDone } = require('../services/queueService');

exports.submitScore = async (req, res) => {
  try {
    const { participantId, scores } = req.body;
    
    const participant = await Participant.findByPk(participantId, {
      include: [Bonsai]
    });
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const hasAccess = await assertParticipantAccess(req.user, participant);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { normalizedScores, totalScore } = calculateTotalScore(scores);

    // Create or update scoring record
    let scoringRecord = await Scoring.findOne({ where: { participant_id: participantId } });
    
    const scoringData = {
      participant_id: participantId,
      judging_number: participant.judging_number || 'TBD',
      nebari_score: normalizedScores.nebari,
      trunk_score: normalizedScores.trunk,
      branch_score: normalizedScores.branch,
      composition_score: normalizedScores.composition,
      pot_score: normalizedScores.pot,
      total_score: totalScore
    };

    if (scoringRecord) {
      await scoringRecord.update(scoringData);
    } else {
      scoringRecord = await Scoring.create(scoringData);
    }

    await markQueueEntryDone(participant);

    // Emit real-time updates via WebSocket
    const io = getIO();
    
    // 1. Update for Live Arena current entry
    io.emit('judging-update', {
      type: 'score_update',
      entry: {
        id: participant.id,
        treeNumber: participant.judging_number,
        treeName: participant.Bonsais?.[0]?.name,
        species: participant.Bonsais?.[0]?.species,
        ownerName: participant.name,
        imageUrl: participant.Bonsais?.[0]?.photo_url,
        scores: normalizedScores,
        totalScore: totalScore
      }
    });

    const rankingScope = req.user?.role === 'juri'
      ? { eventIds: await getAssignedEventIds(req.user.id) }
      : {};
    const rankings = await getRankingData(rankingScope);
    const queueEntries = await getQueueEntries();

    await createAuditLog(req, {
      action: 'scoring.submit',
      entityType: 'participant',
      entityId: participant.id,
      metadata: {
        eventId: participant.event_id,
        judgingNumber: participant.judging_number,
        totalScore,
      },
    });

    const currentQueueEntry = await getCurrentQueueEntry();
    const queueStats = await getQueueStats();

    // 2. Push refreshed leaderboard and ranking table
    io.emit('judging-update', {
      type: 'leaderboard_update',
      rankings: rankings.slice(0, 10)
    });
    io.emit('queue-update', queueEntries.map((entry) => formatQueueEntry(entry, { hidePrivateFields: true })));
    io.emit('ranking-update', rankings);
    io.emit('event-status-update', queueStats);
    io.emit('judging-update', {
      type: 'stats_update',
      stats: {
        totalEntries: queueStats.totalCount,
        totalJudged: queueStats.judgedCount,
        activeViewers: 1,
      }
    });
    io.emit('judging-update', {
      type: 'current_entry_update',
      entry: currentQueueEntry ? formatQueueEntry(currentQueueEntry) : null,
    });

    res.json({
      message: 'Score submitted successfully',
      scoring: scoringRecord,
      scores: normalizedScores,
      totalScore,
      rankings
    });
  } catch (error) {
    console.error('Scoring submission error:', error);
    res.status(500).json({ message: error.message });
  }
};
