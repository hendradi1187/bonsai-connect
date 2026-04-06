const { Op } = require('sequelize');
const { Event, Participant, Bonsai, Scoring } = require('../models');

const DEFAULT_CITY = 'Depok';

const padSequence = (value) => String(value).padStart(4, '0');

const getEventYear = (event) => new Date(event.start_date || event.date).getFullYear();

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
  const existingCount = await Participant.count({
    where: {
      event_id: event.id
    }
  });

  return `PPBI-DPK-${year}-${padSequence(existingCount + 1)}`;
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
    const { eventId, name, phone, city, bonsaiName, species, sizeCategory, photoUrl } = req.body;

    if (!eventId || !name || !phone || !bonsaiName || !species) {
      return res.status(400).json({ message: 'eventId, name, phone, bonsaiName, and species are required' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!isRegistrationOpen(event)) {
      return res.status(400).json({ message: 'Registration is not open for this event' });
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
      photo_url: photoUrl || null
    });

    res.status(201).json({
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
        photoUrl: bonsai.photo_url
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.lookup = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });
    
    const participant = await Participant.findOne({
      where: { phone },
      include: [Bonsai, Scoring]
    });
    
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    
    // Format for Peserta Dashboard
    const formatted = {
      id: participant.id,
      name: participant.name,
      city: participant.city || DEFAULT_CITY,
      trees: participant.Bonsais.map(b => ({
        id: b.id,
        treeNumber: participant.judging_number || 'TBD',
        treeName: b.name,
        species: b.species,
        imageUrl: b.photo_url,
        sizeCategory: b.size_category,
        status: participant.status,
        totalScore: participant.Scoring ? participant.Scoring.total_score : 0
      }))
    };
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { participantId, treeName, species, sizeCategory, photoUrl } = req.body;

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
        photo_url: photoUrl || bonsai.photo_url || null
      });
    } else {
      bonsai = await Bonsai.create({
        owner_id: participantId,
        name: treeName,
        species,
        size_category: sizeCategory || 'Large',
        photo_url: photoUrl || null
      });
    }
    
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
        photoUrl: bonsai.photo_url
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
