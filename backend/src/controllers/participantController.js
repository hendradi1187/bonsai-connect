const { Op } = require('sequelize');
const { Event, Participant, Bonsai, Scoring } = require('../models');
const { getRankingData } = require('../services/rankingService');
const { createAuditLog } = require('../services/auditService');
const { enqueueParticipant, formatQueueEntry, getQueueEntries, getQueueStats } = require('../services/queueService');
const { getIO } = require('../websocket/handlers');

const DEFAULT_CITY = 'Depok';

const padSequence = (value) => String(value).padStart(4, '0');

const getEventYear = (event) => {
  const date = new Date(event.start_date || event.date || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
};

const isRegistrationOpen = (event) => {
  const now = new Date();
  const startDate = new Date(event.start_date || event.date || now);
  const openAt = new Date(event.registration_open_at || new Date(startDate.getTime() - (7 * 24 * 60 * 60 * 1000)));
  const closeAt = new Date(event.registration_close_at || new Date(startDate.getTime() - (24 * 60 * 60 * 1000)));
  return now >= openAt && now <= closeAt;
};

const resolveEvent = async (eventId) => {
  if (eventId) {
    const event = await Event.findByPk(eventId);
    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    return event;
  }

  const activeEvent = await Event.findOne({
    where: {
      status: {
        [Op.in]: ['published', 'registration_open', 'ongoing']
      }
    },
    order: [['start_date', 'DESC'], ['createdAt', 'DESC']]
  });

  if (activeEvent) {
    return activeEvent;
  }

  const publishedEvent = await Event.findOne({
    where: {
      status: 'published'
    },
    order: [['start_date', 'DESC'], ['createdAt', 'DESC']]
  });

  if (publishedEvent) {
    return publishedEvent;
  }

  return Event.create({
    name: `Development Event ${new Date().getFullYear()}`,
    location: DEFAULT_CITY,
    description: 'Automatically created development event',
    start_date: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)),
    end_date: new Date(Date.now() + (16 * 24 * 60 * 60 * 1000)),
    publish_at: new Date(),
    registration_open_at: new Date(),
    registration_close_at: new Date(Date.now() + (13 * 24 * 60 * 60 * 1000)),
    status: 'registration_open'
  });
};

const generateRegistrationNumber = async (event) => {
  const year = getEventYear(event);
  // Find max sequence across ALL participants (all events) to ensure global uniqueness
  const participants = await Participant.findAll({
    attributes: ['registration_number'],
    where: {
      registration_number: {
        [Op.like]: `PPBI-DPK-${year}-%`
      }
    }
  });

  const maxSeq = participants.reduce((max, p) => {
    const match = /(\d+)$/.exec(p.registration_number || '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `PPBI-DPK-${year}-${padSequence(maxSeq + 1)}`;
};

const generateJudgingNumber = async () => {
  const participants = await Participant.findAll({
    attributes: ['judging_number'],
    where: {
      judging_number: {
        [Op.ne]: null
      }
    },
    order: [['createdAt', 'ASC']]
  });

  const maxSequence = participants.reduce((currentMax, participant) => {
    const match = /(\d+)$/.exec(participant.judging_number || '');
    if (!match) {
      return currentMax;
    }

    return Math.max(currentMax, Number(match[1]));
  }, 100);

  return `DBF-${maxSequence + 1}`;
};

exports.getAll = async (req, res) => {
  try {
    const participants = await Participant.findAll({
      include: [Event, Bonsai]
    });
    
    // Format for frontend
    const formatted = participants.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      city: p.city || DEFAULT_CITY,
      eventId: p.event_id,
      eventName: p.Event?.name || 'Unknown Event',
      registrationNumber: p.registration_number,
      judgingNumber: p.judging_number,
      judgingNumberStatus: p.judging_number_status,
      treesCount: p.Bonsais ? p.Bonsais.length : 0,
      status: p.status,
      bonsai: p.Bonsais?.[0] ? {
        id: p.Bonsais[0].id,
        treeName: p.Bonsais[0].name,
        species: p.Bonsais[0].species,
        sizeCategory: p.Bonsais[0].size_category,
        photoUrl: p.Bonsais[0].photo_url,
        accessories: p.Bonsais[0].accessories || [],
      } : null
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, phone, city, eventId } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const event = await resolveEvent(eventId);
    const registrationNumber = await generateRegistrationNumber(event);

    const participant = await Participant.create({
      name,
      phone,
      city: city || DEFAULT_CITY,
      event_id: event.id,
      registration_number: registrationNumber,
      judging_number: await generateJudgingNumber(),
      judging_number_status: 'reserved'
    });

    res.status(201).json({
      id: participant.id,
      name: participant.name,
      phone: participant.phone,
      city: participant.city,
      eventId: participant.event_id,
      registrationNumber: participant.registration_number,
      judgingNumber: participant.judging_number,
      judgingNumberStatus: participant.judging_number_status,
      status: participant.status
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

exports.registerPublic = async (req, res) => {
  try {
    const { eventId, name, phone, city, bonsais } = req.body;

    if (!eventId || !name || !phone || !bonsais || !Array.isArray(bonsais) || bonsais.length === 0) {
      return res.status(400).json({ message: 'eventId, name, phone, and at least one bonsai are required' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!isRegistrationOpen(event)) {
      return res.status(400).json({ message: 'Registration is not open for this event' });
    }

    const results = [];

    for (const bonsaiData of bonsais) {
      const { name: bonsaiName, species, sizeCategory, photoUrl, accessories } = bonsaiData;

      if (!bonsaiName || !species) {
        continue; // Skip invalid entries
      }

      const registrationNumber = await generateRegistrationNumber(event);
      const judgingNumber = await generateJudgingNumber();

      const participant = await Participant.create({
        event_id: event.id,
        name,
        phone,
        city: city || DEFAULT_CITY,
        registration_number: registrationNumber,
        judging_number: judgingNumber,
        judging_number_status: 'reserved',
        status: 'registered'
      });

      const bonsai = await Bonsai.create({
        owner_id: participant.id,
        name: bonsaiName,
        species,
        size_category: sizeCategory || 'Large',
        photo_url: photoUrl || null,
        accessories: Array.isArray(accessories) ? accessories : []
      });

      results.push({
        participant: {
          id: participant.id,
          eventId: participant.event_id,
          name: participant.name,
          phone: participant.phone,
          city: participant.city,
          registrationNumber: participant.registration_number,
          judgingNumber: participant.judging_number,
          judgingNumberStatus: participant.judging_number_status,
          status: participant.status
        },
        bonsai: {
          id: bonsai.id,
          name: bonsai.name,
          species: bonsai.species,
          sizeCategory: bonsai.size_category,
          photoUrl: bonsai.photo_url,
          accessories: bonsai.accessories || []
        }
      });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'No valid bonsai data provided' });
    }

    res.status(201).json({
      success: true,
      count: results.length,
      registrations: results,
      // For backward compatibility with any frontend that expects single object
      participant: results[0].participant,
      bonsai: results[0].bonsai
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.lookup = async (req, res) => {
  try {
    const { phone, registration_number, judging_number } = req.query;

    if (!phone && !registration_number && !judging_number) {
      return res.status(400).json({ message: 'Provide phone, registration_number, or judging_number' });
    }

    const where = {};
    if (phone) where.phone = phone;
    else if (registration_number) where.registration_number = registration_number;
    else if (judging_number) where.judging_number = judging_number;

    const participants = await Participant.findAll({
      where,
      include: [
        { model: Bonsai },
        { model: Event },
        { model: Scoring, as: 'Scorings', where: { judge_id: null }, required: false },
      ],
    });

    if (!participants || participants.length === 0) return res.status(404).json({ message: 'Participant not found' });

    const results = await Promise.all(participants.map(async (participant) => {
      const aggregate = participant.Scorings?.[0] || null;

      // Get ranking position if judged
      let rank = null;
      if (participant.status === 'judged' && aggregate) {
        const rankings = await getRankingData({ eventIds: [participant.event_id] });
        const entry = rankings.find((r) => r.id === participant.id);
        rank = entry?.rank ?? null;
      }

      return {
        id: participant.id,
        name: participant.name,
        city: participant.city || DEFAULT_CITY,
        registrationNumber: participant.registration_number,
        judgingNumber: participant.judging_number,
        judgingNumberStatus: participant.judging_number_status,
        status: participant.status,
        event: participant.Event
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
              appearance: Number(aggregate.appearance_score || 0),
              movement: Number(aggregate.movement_score || 0),
              harmony: Number(aggregate.harmony_score || 0),
              maturity: Number(aggregate.maturity_score || 0),
              // legacy fallback
              nebari: Number(aggregate.nebari_score || 0),
              trunk: Number(aggregate.trunk_score || 0),
              branch: Number(aggregate.branch_score || 0),
              composition: Number(aggregate.composition_score || 0),
              pot: Number(aggregate.pot_score || 0),
            }
          : null,
        bonsai: participant.Bonsais.map((b) => ({
          id: b.id,
          name: b.name,
          species: b.species,
          sizeCategory: b.size_category,
          imageUrl: b.photo_url,
        })),
      };
    }));

    // If searching by unique number, return single object for backward compatibility
    // but if searching by phone, return array of results
    if (registration_number || judging_number) {
      res.json(results[0]);
    } else {
      res.json(results);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { participantId, treeName, species, sizeCategory, photoUrl, accessories } = req.body;

    if (!participantId || !treeName || !species) {
      return res.status(400).json({ message: 'participantId, treeName, and species are required' });
    }
    
    // 1. Update participant status
    const participant = await Participant.findByPk(participantId, {
      include: [Bonsai]
    });
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    
    participant.status = 'checked_in';
    if (!participant.judging_number) {
      participant.judging_number = await generateJudgingNumber();
    }
    participant.judging_number_status = 'confirmed';
    await participant.save();
    
    // 2. Create Bonsai entry
    let bonsai = participant.Bonsais?.[0];

    if (bonsai) {
      await bonsai.update({
        name: treeName,
        species,
        size_category: sizeCategory || bonsai.size_category || 'Large',
        photo_url: photoUrl || bonsai.photo_url || null,
        accessories: Array.isArray(accessories) ? accessories : (bonsai.accessories || [])
      });
    } else {
      bonsai = await Bonsai.create({
        owner_id: participantId,
        name: treeName,
        species,
        size_category: sizeCategory || 'Large',
        photo_url: photoUrl || null,
        accessories: Array.isArray(accessories) ? accessories : []
      });
    }

    const queueEntry = await enqueueParticipant(participant);

    await createAuditLog(req, {
      action: 'participant.check_in',
      entityType: 'participant',
      entityId: participant.id,
      metadata: {
        eventId: participant.event_id,
        queueId: queueEntry.id,
        queueStatus: queueEntry.status,
        judgingNumber: participant.judging_number,
      },
    });

    const io = getIO();
    const queueEntries = await getQueueEntries();
    io.emit('queue-update', queueEntries.map((entry) => formatQueueEntry(entry, { hidePrivateFields: true })));
    io.emit('event-status-update', {
      ...(await getQueueStats()),
    });
    
    res.json({
      participant: {
        id: participant.id,
        name: participant.name,
        city: participant.city || DEFAULT_CITY,
        registrationNumber: participant.registration_number,
        judgingNumber: participant.judging_number,
        judgingNumberStatus: participant.judging_number_status,
        status: participant.status
      },
      bonsai: {
        id: bonsai.id,
        name: bonsai.name,
        species: bonsai.species,
        sizeCategory: bonsai.size_category,
        photoUrl: bonsai.photo_url,
        accessories: bonsai.accessories || []
      },
      queue: {
        id: queueEntry.id,
        status: queueEntry.status,
        order: queueEntry.queue_order,
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.overrideJudgingNumber = async (req, res) => {
  try {
    const { judgingNumber, judgingNumberStatus } = req.body;

    if (!judgingNumber) {
      return res.status(400).json({ message: 'judgingNumber is required' });
    }

    const participant = await Participant.findByPk(req.params.id);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    // Check uniqueness (skip self)
    const { Op } = require('sequelize');
    const conflict = await Participant.findOne({
      where: { judging_number: judgingNumber, id: { [Op.ne]: participant.id } },
    });
    if (conflict) return res.status(409).json({ message: 'Judging number already assigned to another participant' });

    const previous = participant.judging_number;
    participant.judging_number = judgingNumber;
    if (judgingNumberStatus) participant.judging_number_status = judgingNumberStatus;
    await participant.save();

    await createAuditLog(req, {
      action: 'participant.override_judging_number',
      entityType: 'participant',
      entityId: participant.id,
      metadata: { previous, judgingNumber, judgingNumberStatus: participant.judging_number_status },
    });

    res.json({
      message: 'Judging number overridden',
      judgingNumber: participant.judging_number,
      judgingNumberStatus: participant.judging_number_status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
