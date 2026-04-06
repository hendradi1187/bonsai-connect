const { Scoring, Participant, Bonsai } = require('../models');
const { getIO } = require('../websocket/handlers');
const { calculateTotalScore, getRankingData } = require('../services/rankingService');

exports.submitScore = async (req, res) => {
  try {
    const { participantId, scores } = req.body;
    
    const participant = await Participant.findByPk(participantId, {
      include: [Bonsai]
    });
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
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

    // Update participant status to 'judged'
    participant.status = 'judged';
    await participant.save();

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

    const rankings = await getRankingData();

    // 2. Push refreshed leaderboard and ranking table
    io.emit('judging-update', {
      type: 'leaderboard_update',
      rankings: rankings.slice(0, 10)
    });
    io.emit('ranking-update', rankings);

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
