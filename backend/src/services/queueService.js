const { Op } = require('sequelize');
const { Bonsai, JudgingQueue, Participant, Scoring } = require('../models');
const { mapCriterionScores } = require('./rankingService');

const ACTIVE_QUEUE_STATUSES = ['waiting', 'current'];
const QUEUE_STATUS_PRIORITY = {
  current: 0,
  waiting: 1,
  done: 2,
};

const toParticipantStatus = (queueStatus, existingStatus) => {
  if (existingStatus === 'judged' || queueStatus === 'done') {
    return 'judged';
  }

  if (queueStatus === 'current') {
    return 'judging';
  }

  if (queueStatus === 'waiting') {
    return 'waiting';
  }

  return existingStatus || 'registered';
};

const getQueueInclude = () => ([
  {
    model: Participant,
    include: [Bonsai, Scoring],
  },
]);

const deriveQueueStatusFromParticipant = (participantStatus) => {
  if (participantStatus === 'judged') {
    return 'done';
  }

  if (participantStatus === 'judging') {
    return 'current';
  }

  return 'waiting';
};

const pickCanonicalQueueEntry = (entries, participantStatus) => {
  const preferredStatus = deriveQueueStatusFromParticipant(participantStatus);
  const preferred = entries.find((entry) => entry.status === preferredStatus);
  if (preferred) {
    return preferred;
  }

  return [...entries].sort((left, right) => {
    const leftPriority = QUEUE_STATUS_PRIORITY[left.status] ?? 99;
    const rightPriority = QUEUE_STATUS_PRIORITY[right.status] ?? 99;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return left.queue_order - right.queue_order;
  })[0];
};

const formatQueueEntry = (queueEntry, { hidePrivateFields = false } = {}) => {
  const participant = queueEntry.Participant;
  const bonsai = participant?.Bonsais?.[0];
  const scoring = participant?.Scoring;
  const derivedStatus = toParticipantStatus(queueEntry.status, participant?.status);

  return {
    id: participant?.id || queueEntry.participant_id,
    queueId: queueEntry.id,
    eventId: queueEntry.event_id,
    treeNumber: queueEntry.judging_number,
    treeName: bonsai?.name || 'Unknown',
    species: bonsai?.species || 'Unknown',
    imageUrl: bonsai?.photo_url || null,
    ownerName: hidePrivateFields ? null : (participant?.name || null),
    city: hidePrivateFields ? null : (participant?.city || 'Depok'),
    status: derivedStatus,
    queueStatus: queueEntry.status,
    queueOrder: queueEntry.queue_order,
    sizeCategory: bonsai?.size_category || 'Large',
    scores: mapCriterionScores(scoring),
    totalScore: scoring ? scoring.total_score : 0,
  };
};

const syncQueueFromParticipants = async () => {
  const participants = await Participant.findAll({
    where: {
      status: {
        [Op.in]: ['checked_in', 'waiting', 'judging', 'judged'],
      },
      judging_number: {
        [Op.ne]: null,
      },
    },
    order: [['updatedAt', 'ASC'], ['createdAt', 'ASC']],
  });

  if (participants.length === 0) {
    return;
  }

  const existingEntries = await JudgingQueue.findAll({
    order: [['queue_order', 'ASC'], ['createdAt', 'ASC']],
  });
  const entriesByParticipantId = new Map();
  for (const entry of existingEntries) {
    const bucket = entriesByParticipantId.get(entry.participant_id) || [];
    bucket.push(entry);
    entriesByParticipantId.set(entry.participant_id, bucket);
  }

  const nextOrderByEvent = new Map();

  for (const participant of participants) {
    const participantEntries = entriesByParticipantId.get(participant.id) || [];

    if (participantEntries.length > 0) {
      const canonicalEntry = pickCanonicalQueueEntry(participantEntries, participant.status);
      canonicalEntry.event_id = participant.event_id;
      canonicalEntry.judging_number = participant.judging_number;
      canonicalEntry.status = deriveQueueStatusFromParticipant(participant.status);
      await canonicalEntry.save();

      const duplicateEntries = participantEntries.filter((entry) => entry.id !== canonicalEntry.id);
      if (duplicateEntries.length > 0) {
        await JudgingQueue.destroy({
          where: {
            id: {
              [Op.in]: duplicateEntries.map((entry) => entry.id),
            },
          },
        });
      }

      continue;
    }

    let nextOrder = nextOrderByEvent.get(participant.event_id);
    if (!Number.isFinite(nextOrder)) {
      nextOrder = await getNextQueueOrder(participant.event_id);
    }

    await JudgingQueue.create({
      event_id: participant.event_id,
      participant_id: participant.id,
      judging_number: participant.judging_number,
      queue_order: nextOrder,
      status: deriveQueueStatusFromParticipant(participant.status),
    });

    nextOrderByEvent.set(participant.event_id, nextOrder + 1);
  }

  const events = [...new Set(participants.map((participant) => participant.event_id))];
  await Promise.all(events.map((eventId) => refreshCurrentEntry(eventId)));
};

const getQueueEntries = async (where = {}) => {
  await syncQueueFromParticipants();
  const entries = await JudgingQueue.findAll({
    where,
    include: getQueueInclude(),
    order: [
      ['queue_order', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });

  return entries.sort((left, right) => {
    const leftPriority = QUEUE_STATUS_PRIORITY[left.status] ?? 99;
    const rightPriority = QUEUE_STATUS_PRIORITY[right.status] ?? 99;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.queue_order - right.queue_order;
  });
};

const getNextQueueOrder = async (eventId) => {
  const currentMax = await JudgingQueue.max('queue_order', {
    where: {
      event_id: eventId,
    },
  });

  return Number.isFinite(currentMax) ? currentMax + 1 : 1;
};

const refreshCurrentEntry = async (eventId) => {
  const currentEntry = await JudgingQueue.findOne({
    where: {
      event_id: eventId,
      status: 'current',
    },
  });

  if (currentEntry) {
    return currentEntry;
  }

  const nextWaiting = await JudgingQueue.findOne({
    where: {
      event_id: eventId,
      status: 'waiting',
    },
    order: [['queue_order', 'ASC'], ['createdAt', 'ASC']],
  });

  if (!nextWaiting) {
    return null;
  }

  nextWaiting.status = 'current';
  await nextWaiting.save();

  await Participant.update(
    { status: 'judging' },
    { where: { id: nextWaiting.participant_id } }
  );

  return nextWaiting;
};

const advanceQueueForEvent = async (eventId) => {
  const currentEntry = await JudgingQueue.findOne({
    where: {
      event_id: eventId,
      status: 'current',
    },
    order: [['queue_order', 'ASC'], ['createdAt', 'ASC']],
  });

  if (currentEntry) {
    currentEntry.status = 'waiting';
    await currentEntry.save();

    await Participant.update(
      { status: 'waiting' },
      { where: { id: currentEntry.participant_id } }
    );
  }

  return refreshCurrentEntry(eventId);
};

const setCurrentQueueEntry = async (queueId) => {
  const targetEntry = await JudgingQueue.findByPk(queueId);
  if (!targetEntry) {
    return null;
  }

  if (targetEntry.status === 'done') {
    throw new Error('Cannot set a done queue entry as current');
  }

  const eventEntries = await JudgingQueue.findAll({
    where: {
      event_id: targetEntry.event_id,
      status: {
        [Op.in]: ACTIVE_QUEUE_STATUSES,
      },
    },
  });

  for (const entry of eventEntries) {
    if (entry.id === targetEntry.id) {
      entry.status = 'current';
      await entry.save();
      await Participant.update(
        { status: 'judging' },
        { where: { id: entry.participant_id } }
      );
      continue;
    }

    entry.status = 'waiting';
    await entry.save();
    await Participant.update(
      { status: 'waiting' },
      { where: { id: entry.participant_id } }
    );
  }

  return targetEntry;
};

const enqueueParticipant = async (participant) => {
  const existing = await JudgingQueue.findOne({
    where: {
      participant_id: participant.id,
    },
  });

  if (existing) {
    if (existing.status === 'done') {
      existing.status = 'waiting';
      existing.queue_order = await getNextQueueOrder(participant.event_id);
      await existing.save();
    }

    await refreshCurrentEntry(participant.event_id);
    return existing;
  }

  const hasCurrent = await JudgingQueue.count({
    where: {
      event_id: participant.event_id,
      status: {
        [Op.in]: ACTIVE_QUEUE_STATUSES,
      },
    },
  });

  const queueEntry = await JudgingQueue.create({
    event_id: participant.event_id,
    participant_id: participant.id,
    judging_number: participant.judging_number,
    queue_order: await getNextQueueOrder(participant.event_id),
    status: hasCurrent === 0 ? 'current' : 'waiting',
  });

  participant.status = queueEntry.status === 'current' ? 'judging' : 'waiting';
  await participant.save();

  return queueEntry;
};

const markQueueEntryDone = async (participant) => {
  const queueEntry = await JudgingQueue.findOne({
    where: {
      participant_id: participant.id,
    },
  });

  if (!queueEntry) {
    return null;
  }

  queueEntry.status = 'done';
  await queueEntry.save();

  participant.status = 'judged';
  await participant.save();

  await refreshCurrentEntry(participant.event_id);

  return queueEntry;
};

const reorderQueueEntries = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const queueEntries = await JudgingQueue.findAll({
    where: {
      id: {
        [Op.in]: items.map((item) => item.id),
      },
      status: {
        [Op.in]: ACTIVE_QUEUE_STATUSES,
      },
    },
  });

  const byId = new Map(queueEntries.map((entry) => [entry.id, entry]));

  await Promise.all(items.map(async (item, index) => {
    const entry = byId.get(item.id);
    if (!entry) {
      return;
    }

    entry.queue_order = Number.isFinite(item.order) ? item.order : index;
    await entry.save();
  }));

  return getQueueEntries({
    event_id: queueEntries[0]?.event_id,
  });
};

const getQueueStats = async () => {
  await syncQueueFromParticipants();
  const totalEntries = await JudgingQueue.count();
  const totalJudged = await JudgingQueue.count({ where: { status: 'done' } });
  const inQueue = await JudgingQueue.count({
    where: {
      status: {
        [Op.in]: ACTIVE_QUEUE_STATUSES,
      },
    },
  });
  const currentCount = await JudgingQueue.count({ where: { status: 'current' } });

  return {
    totalCount: totalEntries,
    judgedCount: totalJudged,
    pendingCount: inQueue,
    inQueue,
    currentCount,
  };
};

const getCurrentQueueEntry = async () => {
  await syncQueueFromParticipants();
  return JudgingQueue.findOne({
    where: {
      status: 'current',
    },
    include: getQueueInclude(),
    order: [['queue_order', 'ASC'], ['createdAt', 'ASC']],
  });
};

module.exports = {
  ACTIVE_QUEUE_STATUSES,
  advanceQueueForEvent,
  enqueueParticipant,
  formatQueueEntry,
  getCurrentQueueEntry,
  getQueueEntries,
  getQueueStats,
  markQueueEntryDone,
  refreshCurrentEntry,
  reorderQueueEntries,
  setCurrentQueueEntry,
};
