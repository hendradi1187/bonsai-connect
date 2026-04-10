const { getCurrentQueueEntry, getQueueStats, formatQueueEntry } = require('../services/queueService');
const { getIO } = require('../websocket/handlers');
const { getRankingData } = require('../services/rankingService');

// This would normally be in a database or redis
let eventStatus = {
  isActive: false,
  activeJudges: 0,
  publicViewers: 0
};

exports.getStatus = async (req, res) => {
  try {
    const queueStats = await getQueueStats();
    
    res.json({
      ...eventStatus,
      ...queueStats
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
    io.emit('event-status-update', {
      ...eventStatus,
      ...(await getQueueStats()),
    });
    
    res.json(eventStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLiveStatus = async (req, res) => {
  try {
    const currentEntry = await getCurrentQueueEntry();

    const rankings = await getRankingData({ limit: 10 });
    const queueStats = await getQueueStats();

    res.json({
      currentJudging: currentEntry ? formatQueueEntry(currentEntry) : null,
      leaderboard: rankings,
      stats: {
        totalEntries: queueStats.totalCount,
        totalJudged: queueStats.judgedCount,
        activeViewers: eventStatus.publicViewers + 1 // dummy +1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
