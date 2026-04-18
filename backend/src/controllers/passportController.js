const { Op } = require('sequelize');
const { Bonsai, Participant, Scoring, Event, Certificate } = require('../models');
const { getRankingData } = require('../services/rankingService');

const formatPassportCard = (b) => {
  const participant = b.Participant;
  const scoring = participant?.Scorings?.[0] || null;
  return {
    id: b.id,
    passportId: b.passport_id,
    treeName: b.name,
    species: b.species,
    ownerName: participant?.name || '',
    city: participant?.city || '',
    category: b.size_category,
    heightCm: b.height_cm,
    estimatedAge: b.estimated_age,
    style: b.style,
    photoUrl: b.photo_url || null,
    status: b.passport_status || 'registered',
    averageScore: scoring ? Number(scoring.total_score) : null,
    registrationDate: b.createdAt,
  };
};

exports.listPassports = async (req, res) => {
  try {
    const bonsai = await Bonsai.findAll({
      where: { passport_id: { [Op.ne]: null } },
      include: [
        {
          model: Participant,
          include: [
            {
              model: Scoring,
              as: 'Scorings',
              where: { judge_id: null },
              required: false,
            },
          ],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json(bonsai.map(formatPassportCard));
  } catch (error) {
    console.error('[passport] listPassports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchPassports = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  const term = q.trim();
  try {
    const bonsai = await Bonsai.findAll({
      where: {
        passport_id: { [Op.ne]: null },
        [Op.or]: [
          { passport_id: { [Op.iLike]: `%${term}%` } },
          { name: { [Op.iLike]: `%${term}%` } },
          { species: { [Op.iLike]: `%${term}%` } },
          { '$Participant.name$': { [Op.iLike]: `%${term}%` } },
        ],
      },
      include: [{ model: Participant, required: false }],
      subQuery: false,
      limit: 20,
    });

    res.json(
      bonsai.map((b) => ({
        passportId: b.passport_id,
        treeName: b.name,
        species: b.species,
        ownerName: b.Participant?.name || '',
        city: b.Participant?.city || '',
      }))
    );
  } catch (error) {
    console.error('[passport] searchPassports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPassport = async (req, res) => {
  const { passportId } = req.params;
  try {
    const bonsai = await Bonsai.findOne({
      where: { passport_id: passportId },
      include: [
        {
          model: Participant,
          include: [
            { model: Event },
            { model: Scoring, as: 'Scorings', where: { judge_id: null }, required: false },
          ],
        },
      ],
    });

    if (!bonsai) return res.status(404).json({ message: 'Passport not found' });

    const participant = bonsai.Participant;
    const aggregate = participant?.Scorings?.[0] || null;

    // Fetch rank from rankings if judged
    let rank = null;
    if (participant?.status === 'judged' && aggregate) {
      try {
        const rankings = await getRankingData({ eventIds: [participant.event_id] });
        const entry = rankings.find((r) => r.id === participant.id);
        rank = entry?.rank ?? null;
      } catch (_) {
        // non-fatal: rank stays null
      }
    }

    res.json({
      id: participant?.id,
      name: participant?.name || '',
      city: participant?.city || '',
      registrationNumber: participant?.registration_number || '',
      judgingNumber: participant?.judging_number || '',
      judgingNumberStatus: participant?.judging_number_status,
      status: participant?.status || 'registered',
      event: participant?.Event
        ? {
            id: participant.Event.id,
            name: participant.Event.name,
            location: participant.Event.location,
            startDate: participant.Event.start_date,
            endDate: participant.Event.end_date,
          }
        : null,
      rank,
      totalScore: aggregate ? Number(aggregate.total_score) : null,
      scores: aggregate
        ? {
            nebari: Number(aggregate.nebari_score),
            trunk: Number(aggregate.trunk_score),
            branch: Number(aggregate.branch_score),
            composition: Number(aggregate.composition_score),
            pot: Number(aggregate.pot_score),
            appearance: aggregate.appearance_score ? Number(aggregate.appearance_score) : undefined,
            movement: aggregate.movement_score ? Number(aggregate.movement_score) : undefined,
            harmony: aggregate.harmony_score ? Number(aggregate.harmony_score) : undefined,
            maturity: aggregate.maturity_score ? Number(aggregate.maturity_score) : undefined,
            note: aggregate.judge_note || undefined,
          }
        : null,
      bonsai: [
        {
          id: bonsai.id,
          name: bonsai.name,
          species: bonsai.species,
          sizeCategory: bonsai.size_category,
          imageUrl: bonsai.photo_url || null,
          passportId: bonsai.passport_id,
          heightCm: bonsai.height_cm,
          estimatedAge: bonsai.estimated_age,
          style: bonsai.style,
        },
      ],
    });
  } catch (error) {
    console.error('[passport] getPassport error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
