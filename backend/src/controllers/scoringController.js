const { Op } = require('sequelize');
const { Scoring, Participant, Bonsai, JudgeAssignment } = require('../models');
const { getIO } = require('../websocket/handlers');
const { calculateTotalScore, getRankingData } = require('../services/rankingService');
const { assertParticipantAccess, getAssignedEventIds } = require('../services/accessScope');
const { createAuditLog } = require('../services/auditService');
const { formatQueueEntry, getCurrentQueueEntry, getQueueEntries, getQueueStats, markQueueEntryDone } = require('../services/queueService');

/**
 * Compute or update the aggregate scoring row (judge_id = null) for a participant
 * by averaging all per-judge rows.
 */
const computeAggregateScore = async (participantId, judgingNumber) => {
  const judgeRows = await Scoring.findAll({
    where: { participant_id: participantId, judge_id: { [Op.ne]: null } },
  });

  if (judgeRows.length === 0) return null;

  const count = judgeRows.length;
  const avg = (key) => judgeRows.reduce((sum, r) => sum + Number(r[key] || 0), 0) / count;

  const aggregateData = {
    participant_id: participantId,
    judging_number: judgingNumber,
    judge_id: null,
    // Legacy support
    nebari_score: avg('nebari_score'),
    trunk_score: avg('trunk_score'),
    branch_score: avg('branch_score'),
    composition_score: avg('composition_score'),
    pot_score: avg('pot_score'),
    // New Criteria
    appearance_score: avg('appearance_score'),
    movement_score: avg('movement_score'),
    harmony_score: avg('harmony_score'),
    maturity_score: avg('maturity_score'),
  };
  
  // Re-compute total cleanly from new criteria if available, else legacy
  if (aggregateData.appearance_score > 0) {
    aggregateData.total_score = Number(
      (aggregateData.appearance_score + aggregateData.movement_score + 
       aggregateData.harmony_score + aggregateData.maturity_score).toFixed(2)
    );
  } else {
    aggregateData.total_score = Number(
      (aggregateData.nebari_score + aggregateData.trunk_score + aggregateData.branch_score +
        aggregateData.composition_score + aggregateData.pot_score).toFixed(2)
    );
  }

  const existing = await Scoring.findOne({ where: { participant_id: participantId, judge_id: null } });
  if (existing) {
    await existing.update(aggregateData);
    return existing;
  }
  return Scoring.create(aggregateData);
};

/**
 * Returns true when all actively-assigned judges for the event have submitted a score.
 * Falls back to true when no formal judge assignments exist (single-judge mode).
 */
const allJudgesSubmitted = async (participant) => {
  const assignments = await JudgeAssignment.findAll({
    where: { event_id: participant.event_id, is_active: true },
  });

  if (assignments.length === 0) return true; // no formal assignments → single-judge mode

  const assignedIds = assignments.map((a) => a.user_id);
  const submitted = await Scoring.findAll({
    where: {
      participant_id: participant.id,
      judge_id: { [Op.in]: assignedIds },
    },
  });

  return submitted.length >= assignedIds.length;
};

exports.submitScore = async (req, res) => {
  try {
    const { participantId, scores } = req.body;
    const judgeId = req.user?.id || null;
    const isSuperadmin = req.user?.role === 'superadmin';

    const participant = await Participant.findByPk(participantId, {
      include: [Bonsai],
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const hasAccess = await assertParticipantAccess(req.user, participant);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Prevent double scoring: reject if this judge already has a row
    const existingJudgeRow = judgeId
      ? await Scoring.findOne({ where: { participant_id: participantId, judge_id: judgeId } })
      : null;

    if (existingJudgeRow && !isSuperadmin) {
      return res.status(409).json({ message: 'You have already scored this participant' });
    }

    const { normalizedScores, totalScore, predicate } = calculateTotalScore(scores);
    const judgeNote = req.body.note || null;

    const judgeScoreData = {
      participant_id: participantId,
      judging_number: participant.judging_number || 'TBD',
      judge_id: judgeId,
      // Mapping to new DB columns
      appearance_score: normalizedScores.appearance,
      movement_score: normalizedScores.movement,
      harmony_score: normalizedScores.harmony,
      maturity_score: normalizedScores.maturity,
      judge_note: judgeNote,
      total_score: totalScore,
    };

    let judgeScoreRecord;
    if (existingJudgeRow) {
      // Superadmin override
      await existingJudgeRow.update(judgeScoreData);
      judgeScoreRecord = existingJudgeRow;
    } else {
      judgeScoreRecord = await Scoring.create(judgeScoreData);
    }

    // Compute aggregate across all judges
    const aggregateRecord = await computeAggregateScore(participantId, participant.judging_number || 'TBD');

    // Mark done only when all judges have submitted
    const done = await allJudgesSubmitted(participant);
    if (done) {
      await markQueueEntryDone(participant);
    }

    // Emit real-time updates via WebSocket
    const io = getIO();

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
        totalScore: aggregateRecord?.total_score ?? totalScore,
        predicate: aggregateRecord ? calculateTotalScore({
          appearance: aggregateRecord.appearance_score,
          movement: aggregateRecord.movement_score,
          harmony: aggregateRecord.harmony_score,
          maturity: aggregateRecord.maturity_score
        }).predicate : predicate,
      },
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
        judgeId,
      },
    });

    const currentQueueEntry = await getCurrentQueueEntry();
    const queueStats = await getQueueStats();

    io.emit('judging-update', { type: 'leaderboard_update', rankings: rankings.slice(0, 10) });
    io.emit('queue-update', queueEntries.map((entry) => formatQueueEntry(entry, { hidePrivateFields: true })));
    io.emit('ranking-update', rankings);
    io.emit('event-status-update', queueStats);
    io.emit('judging-update', {
      type: 'stats_update',
      stats: { totalEntries: queueStats.totalCount, totalJudged: queueStats.judgedCount, activeViewers: 1 },
    });
    io.emit('judging-update', {
      type: 'current_entry_update',
      entry: currentQueueEntry ? formatQueueEntry(currentQueueEntry) : null,
    });

    res.json({
      message: done ? 'Score submitted and entry finalized' : 'Score submitted — waiting for other judges',
      scoring: judgeScoreRecord,
      scores: normalizedScores,
      totalScore: aggregateRecord?.total_score ?? totalScore,
      finalized: done,
      rankings,
    });
  } catch (error) {
    console.error('Scoring submission error:', error);
    res.status(500).json({ message: error.message });
  }
};
