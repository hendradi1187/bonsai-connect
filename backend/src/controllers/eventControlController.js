const { Participant, Bonsai, Scoring } = require('../models');
const { getIO } = require('../websocket/handlers');
const { getRankingData, mapCriterionScores } = require('../services/rankingService');

// This would normally be in a database or redis
let eventStatus = {
  isActive: false,
  activeJudges: 0,
  publicViewers: 0
};

exports.getStatus = async (req, res) => {
  try {
    const totalCount = await Participant.count();
    const judgedCount = await Participant.count({ where: { status: 'judged' } });
    const pendingCount = await Participant.count({ where: { status: ['checked_in', 'waiting', 'judging'] } });
    
    res.json({
      ...eventStatus,
      totalCount,
      judgedCount,
      pendingCount,
      inQueue: pendingCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { action } = req.body;
    
    if (action === 'start') eventStatus.isActive = true;
    if (action === 'stop') eventStatus.isActive = false;
    
    const io = getIO();
    io.emit('event-status-update', eventStatus);
    
    res.json(eventStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLiveStatus = async (req, res) => {
  try {
    // Current entry being judged
    const currentEntry = await Participant.findOne({
      where: { status: 'judging' },
      include: [Bonsai, Scoring]
    });

    const rankings = await getRankingData({ limit: 10 });

    const totalEntries = await Participant.count();
    const totalJudged = await Participant.count({ where: { status: 'judged' } });

    res.json({
      currentJudging: currentEntry ? {
        id: currentEntry.id,
        treeNumber: currentEntry.judging_number,
        treeName: currentEntry.Bonsais?.[0]?.name,
        species: currentEntry.Bonsais?.[0]?.species,
        ownerName: currentEntry.name,
        imageUrl: currentEntry.Bonsais?.[0]?.photo_url,
        scores: mapCriterionScores(currentEntry.Scoring),
        totalScore: currentEntry.Scoring?.total_score || 0
      } : null,
      leaderboard: rankings,
      stats: {
        totalEntries,
        totalJudged,
        activeViewers: eventStatus.publicViewers + 1 // dummy +1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
