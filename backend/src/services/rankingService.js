const { Op } = require('sequelize');
const { Participant, Bonsai, Scoring } = require('../models');

const SCORE_KEYS = ['appearance', 'movement', 'harmony', 'maturity'];
const LEGACY_SCORE_KEYS = ['nebari', 'trunk', 'branch', 'composition', 'pot'];

const getPredicate = (totalScore) => {
  if (totalScore >= 321) return 'Baik Sekali';
  if (totalScore >= 281) return 'Baik';
  if (totalScore >= 241) return 'Cukup';
  return 'Kurang';
};

const getElementGrade = (score) => {
  if (score >= 81) return 'A';
  if (score >= 71) return 'B';
  if (score >= 61) return 'C';
  return 'D';
};

const clampScore = (value, min = 0, max = 100) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }

  return Math.min(max, Math.max(min, numeric));
};

const normalizeScores = (scores = {}) => {
  return SCORE_KEYS.reduce((accumulator, key) => {
    // New rules: scale 50-90. We clamp but allow flexibility if juri enters slightly outside.
    // The instructions say A: 81-90, B: 71-80, C: 61-70, D: 50-60.
    accumulator[key] = clampScore(scores[key], 0, 100); 
    return accumulator;
  }, {});
};

const calculateTotalScore = (scores = {}) => {
  const normalizedScores = normalizeScores(scores);
  const total = SCORE_KEYS.reduce((sum, key) => sum + normalizedScores[key], 0);

  return {
    normalizedScores,
    totalScore: Number(total.toFixed(2)),
    predicate: getPredicate(total),
  };
};

const mapCriterionScores = (scoring) => {
  if (!scoring) {
    return null;
  }

  // Check if it's new system or old
  if (scoring.appearance_score > 0) {
    return {
      appearance: Number(scoring.appearance_score || 0),
      movement: Number(scoring.movement_score || 0),
      harmony: Number(scoring.harmony_score || 0),
      maturity: Number(scoring.maturity_score || 0),
      predicate: getPredicate(scoring.total_score),
      note: scoring.judge_note
    };
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
    predicate: getPredicate(totalScore),
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
