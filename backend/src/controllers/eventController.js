const { Event, Participant, Bonsai } = require('../models');

const toDate = (value, fallback) => new Date(value || fallback);

const validateEventTimeline = ({ publishAt, registrationOpenAt, registrationCloseAt, startDate, endDate }) => {
  const publish = new Date(publishAt);
  const registrationOpen = new Date(registrationOpenAt);
  const registrationClose = new Date(registrationCloseAt);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(publish.getTime()) || Number.isNaN(registrationOpen.getTime()) || Number.isNaN(registrationClose.getTime()) || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const error = new Error('Invalid event date value');
    error.statusCode = 400;
    throw error;
  }

  if (!(publish <= registrationOpen && registrationOpen <= registrationClose && registrationClose <= start)) {
    const error = new Error('Invalid timeline: publish_at <= registration_open_at <= registration_close_at <= start_date must be satisfied');
    error.statusCode = 400;
    throw error;
  }

  if (end < start) {
    const error = new Error('Invalid timeline: end_date must be greater than or equal to start_date');
    error.statusCode = 400;
    throw error;
  }
};

const getRegistrationPhase = (event) => {
  const now = new Date();
  const baseDate = event.start_date || event.date || event.createdAt || now;
  const publishAt = toDate(event.publish_at, event.createdAt || now);
  const openAt = toDate(event.registration_open_at, new Date(new Date(baseDate).getTime() - (7 * 24 * 60 * 60 * 1000)));
  const closeAt = toDate(event.registration_close_at, new Date(new Date(baseDate).getTime() - (24 * 60 * 60 * 1000)));
  const startAt = toDate(event.start_date, baseDate);
  const endAt = toDate(event.end_date, event.start_date || event.date || baseDate);

  if (now < publishAt) {
    return 'draft';
  }

  if (now < openAt) {
    return 'published';
  }

  if (now <= closeAt) {
    return 'registration_open';
  }

  if (now < startAt) {
    return 'registration_closed';
  }

  if (now <= endAt) {
    return 'ongoing';
  }

  return 'finished';
};

const formatEvent = async (event) => {
  const totalParticipants = await Participant.count({
    where: {
      event_id: event.id,
    },
  });

  const totalBonsai = await Bonsai.count({
    include: [{
      model: Participant,
      required: true,
      where: {
        event_id: event.id,
      },
      attributes: [],
    }],
  });

  const registrationStatus = getRegistrationPhase(event);

  return {
    id: event.id,
    name: event.name,
    location: event.location || 'Depok',
    description: event.description || '',
    bannerUrl: event.banner_url || '',
    rewards: event.rewards || '',
    categories: event.categories || [],
    contactPersons: event.contact_persons || [],
    startDate: event.start_date || event.date,
    endDate: event.end_date || event.start_date || event.date,
    publishAt: event.publish_at || event.createdAt,
    registrationOpenAt: event.registration_open_at || new Date(new Date(event.start_date || event.date).getTime() - (7 * 24 * 60 * 60 * 1000)),
    registrationCloseAt: event.registration_close_at || new Date(new Date(event.start_date || event.date).getTime() - (24 * 60 * 60 * 1000)),
    status: registrationStatus,
    configuredStatus: event.status,
    isLocked: event.is_locked ?? false,
    totalParticipants,
    totalBonsai,
    registrationAvailable: registrationStatus === 'registration_open',
  };
};

exports.getAdminEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['start_date', 'ASC'], ['createdAt', 'ASC']],
    });

    const formatted = await Promise.all(events.map(formatEvent));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {},
      order: [['start_date', 'ASC']],
    });

    const visibleEvents = events.filter((event) => new Date(event.publish_at) <= new Date());
    const formatted = await Promise.all(visibleEvents.map(formatEvent));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event || new Date(event.publish_at) > new Date()) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(await formatEvent(event));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleLock = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.is_locked = !event.is_locked;
    await event.save();

    res.json({ id: event.id, isLocked: event.is_locked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      bannerUrl,
      rewards,
      categories,
      contactPersons,
      startDate,
      endDate,
      publishAt,
      registrationOpenAt,
      registrationCloseAt,
      status,
    } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'name, startDate, and endDate are required' });
    }

    const start = toDate(startDate);
    const end = toDate(endDate);
    const publish = publishAt ? toDate(publishAt) : start;
    const registrationOpen = registrationOpenAt ? toDate(registrationOpenAt) : new Date(start.getTime() - (7 * 24 * 60 * 60 * 1000));
    const registrationClose = registrationCloseAt ? toDate(registrationCloseAt) : new Date(start.getTime() - (24 * 60 * 60 * 1000));

    validateEventTimeline({
      publishAt: publish,
      registrationOpenAt: registrationOpen,
      registrationCloseAt: registrationClose,
      startDate: start,
      endDate: end,
    });

    const event = await Event.create({
      name,
      location: location || 'Depok',
      description: description || '',
      banner_url: bannerUrl || null,
      rewards: rewards || null,
      categories: categories || [],
      contact_persons: contactPersons || [],
      start_date: start,
      end_date: end,
      publish_at: publish,
      registration_open_at: registrationOpen,
      registration_close_at: registrationClose,
      status: status || 'published',
    });

    res.status(201).json(await formatEvent(event));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const {
      name,
      location,
      description,
      bannerUrl,
      rewards,
      categories,
      contactPersons,
      startDate,
      endDate,
      publishAt,
      registrationOpenAt,
      registrationCloseAt,
      status,
    } = req.body;

    const nextStartDate = startDate ? toDate(startDate) : (event.start_date || event.date);
    const nextEndDate = endDate ? toDate(endDate) : (event.end_date || event.start_date || event.date);
    const nextPublishAt = publishAt ? toDate(publishAt) : (event.publish_at || event.createdAt);
    const nextRegistrationOpenAt = registrationOpenAt
      ? toDate(registrationOpenAt)
      : (event.registration_open_at || new Date(new Date(nextStartDate).getTime() - (7 * 24 * 60 * 60 * 1000)));
    const nextRegistrationCloseAt = registrationCloseAt
      ? toDate(registrationCloseAt)
      : (event.registration_close_at || new Date(new Date(nextStartDate).getTime() - (24 * 60 * 60 * 1000)));

    validateEventTimeline({
      publishAt: nextPublishAt,
      registrationOpenAt: nextRegistrationOpenAt,
      registrationCloseAt: nextRegistrationCloseAt,
      startDate: nextStartDate,
      endDate: nextEndDate,
    });

    await event.update({
      name: name ?? event.name,
      location: location ?? event.location,
      description: description ?? event.description,
      banner_url: bannerUrl ?? event.banner_url,
      rewards: rewards ?? event.rewards,
      categories: categories ?? event.categories,
      contact_persons: contactPersons ?? event.contact_persons,
      start_date: nextStartDate,
      end_date: nextEndDate,
      publish_at: nextPublishAt,
      registration_open_at: nextRegistrationOpenAt,
      registration_close_at: nextRegistrationCloseAt,
      status: status ?? event.status,
    });

    res.json(await formatEvent(event));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.archiveEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await event.update({ status: 'finished' });
    res.json({ message: 'Event diarsipkan', status: 'finished' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Participant, attributes: ['id'] }]
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const participantCount = event.Participants?.length ?? 0;
    if (participantCount > 0) {
      return res.status(409).json({
        message: `Event tidak bisa dihapus karena sudah memiliki ${participantCount} peserta. Arsipkan event (status: finished) jika tidak diperlukan lagi.`
      });
    }

    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
