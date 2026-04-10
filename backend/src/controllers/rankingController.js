const { getRankingData } = require('../services/rankingService');
const { getAssignedEventIds } = require('../services/accessScope');

exports.getRankings = async (req, res) => {
  try {
    const { category } = req.query;

    const options = { category };
    if (req.user?.role === 'juri') {
      options.eventIds = await getAssignedEventIds(req.user.id);
    }

    const rankings = await getRankingData(options);
    const isJudgeOnly = req.user?.role === 'juri';

    res.json(rankings.map((row) => ({
      ...row,
      ownerName: isJudgeOnly ? null : row.ownerName,
      city: isJudgeOnly ? null : row.city,
    })));
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ message: error.message });
  }
};
