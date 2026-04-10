const { Op } = require('sequelize');
const { Participant, Bonsai, Scoring } = require('../models');

const SCORE_KEYS = ['nebari', 'trunk', 'branch', 'composition', 'pot'];

const clampScore = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.min(20, Math.max(0, numeric));
};

const normalizeScores = (scores = {}) => {
  return SCORE_KEYS.reduce((accumulator, key) => {
    accumulator[key] = clampScore(scores[key]);
    return accumulator;
  }, {});
};

const calculateTotalScore = (scores = {}) => {
  const normalizedScores = normalizeScores(scores);
  const total = SCORE_KEYS.reduce((sum, key) => sum + normalizedScores[key], 0);

  return {
    normalizedScores,
    totalScore: Number(total.toFixed(2)),
  };
};

const mapCriterionScores = (scoring) => {
  if (!scoring) {
    return null;
  }

  return {
    nebari: Number(scoring.nebari_score || 0),
    trunk: Number(scoring.trunk_score || 0),
    branch: Number(scoring.branch_score || 0),
    composition: Number(scoring.composition_score || 0),
    pot: Number(scoring.pot_score || 0),
  };
};

const formatRankingRow = (participant, index, previousScore) => {
  // Scorings is an array; the aggregate row (judge_id = null) is filtered in the query
  const aggregate = participant.Scorings?.[0];
  const totalScore = Number(aggregate?.total_score || 0);
  const rank = previousScore !== null && totalScore === previousScore ? index : index + 1;

  return {
    id: participant.id,
    rank,
    treeNumber: participant.judging_number,
    treeName: participant.Bonsais?.[0]?.name || 'Unknown',
    species: participant.Bonsais?.[0]?.species || 'Unknown',
    ownerName: participant.name,
    city: participant.city || 'Depok',
    sizeCategory: participant.Bonsais?.[0]?.size_category || 'Large',
    totalScore,
    scores: mapCriterionScores(aggregate),
  };
};

const getRankingData = async ({ category, limit, eventIds } = {}) => {
  const participantWhere = {
    status: 'judged',
  };

  if (Array.isArray(eventIds)) {
    participantWhere.event_id = {
      [Op.in]: eventIds,
    };
  }

  const participants = await Participant.findAll({
    where: participantWhere,
    include: [
      { model: Bonsai },
      { model: Scoring, as: 'Scorings', required: true, where: { judge_id: null } },
    ],
    order: [
      [{ model: Scoring, as: 'Scorings' }, 'total_score', 'DESC'],
      ['judging_number', 'ASC'],
    ],
  });

  let previousScore = null;
  const formatted = participants.map((participant, index) => {
    const row = formatRankingRow(participant, index, previousScore);
    previousScore = row.totalScore;
    return row;
  });

  const filtered = category && category !== 'All'
    ? formatted.filter((item) => item.sizeCategory === category)
    : formatted;

  return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
};

module.exports = {
  SCORE_KEYS,
  normalizeScores,
  calculateTotalScore,
  mapCriterionScores,
  getRankingData,
};
