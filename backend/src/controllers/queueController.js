const { Op } = require('sequelize');
const { Participant, Bonsai, Scoring } = require('../models');
const { mapCriterionScores } = require('../services/rankingService');
const { getParticipantScope } = require('../services/accessScope');

exports.getQueue = async (req, res) => {
  try {
    // In a real app, this would use a dedicated Queue table or order column
    // For now, let's get participants who are checked_in/waiting but not yet judged
    const accessScope = await getParticipantScope(req.user);
    const queue = await Participant.findAll({
      where: {
        ...accessScope,
        status: {
          [Op.in]: ['checked_in', 'waiting', 'judging']
        }
      },
      include: [Bonsai, Scoring],
      order: [['updatedAt', 'ASC']]
    });

    const isJudgeOnly = req.user?.role === 'juri';

    const formatted = queue.map(p => ({
      id: p.id,
      eventId: p.event_id,
      treeNumber: p.judging_number,
      treeName: p.Bonsais?.[0]?.name || 'Unknown',
      species: p.Bonsais?.[0]?.species || 'Unknown',
      imageUrl: p.Bonsais?.[0]?.photo_url,
      ownerName: isJudgeOnly ? null : p.name,
      city: isJudgeOnly ? null : (p.city || 'Depok'),
      status: p.status,
      scores: mapCriterionScores(p.Scoring),
      totalScore: p.Scoring ? p.Scoring.total_score : 0
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body;
    // Logical reorder implementation would go here
    res.json({ message: 'Queue reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
