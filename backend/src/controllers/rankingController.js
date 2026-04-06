const { getRankingData } = require('../services/rankingService');

exports.getRankings = async (req, res) => {
  try {
    const { category } = req.query;

    const rankings = await getRankingData({ category });

    res.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ message: error.message });
  }
};
