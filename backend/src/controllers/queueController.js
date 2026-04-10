const { getAssignedEventIds } = require('../services/accessScope');
const { createAuditLog } = require('../services/auditService');
const { getIO } = require('../websocket/handlers');
const {
  advanceQueueForEvent,
  formatQueueEntry,
  getCurrentQueueEntry,
  getQueueEntries,
  getQueueStats,
  reorderQueueEntries,
  setCurrentQueueEntry,
} = require('../services/queueService');

const emitQueueRefresh = async () => {
  const io = getIO();
  const queueEntries = await getQueueEntries();
  const queueStats = await getQueueStats();
  const currentEntry = await getCurrentQueueEntry();

  io.emit('queue-update', queueEntries.map((entry) => formatQueueEntry(entry, { hidePrivateFields: true })));
  io.emit('event-status-update', queueStats);
  io.emit('judging-update', {
    type: 'current_entry_update',
    entry: currentEntry ? formatQueueEntry(currentEntry) : null,
  });
  io.emit('judging-update', {
    type: 'stats_update',
    stats: {
      totalEntries: queueStats.totalCount,
      totalJudged: queueStats.judgedCount,
      activeViewers: 1,
    },
  });
};

exports.getQueue = async (req, res) => {
  try {
    const where = {};
    if (req.user?.role === 'juri') {
      const eventIds = await getAssignedEventIds(req.user.id);
      where.event_id = eventIds;
    }

    const queue = await getQueueEntries(where);

    const isJudgeOnly = req.user?.role === 'juri';
    const formatted = queue.map((entry) => formatQueueEntry(entry, { hidePrivateFields: isJudgeOnly }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body;
    await reorderQueueEntries(items);

    await createAuditLog(req, {
      action: 'queue.reorder',
      entityType: 'judging_queue',
      entityId: null,
      metadata: {
        count: Array.isArray(items) ? items.length : 0,
      },
    });

    await emitQueueRefresh();

    res.json({ message: 'Queue reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.advanceQueue = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'eventId is required' });
    }

    const currentEntry = await advanceQueueForEvent(eventId);

    await createAuditLog(req, {
      action: 'queue.advance',
      entityType: 'judging_queue',
      entityId: currentEntry?.id || null,
      metadata: {
        eventId,
        nextParticipantId: currentEntry?.participant_id || null,
      },
    });

    await emitQueueRefresh();

    res.json({
      message: currentEntry ? 'Queue advanced successfully' : 'No waiting entry available',
      currentQueueId: currentEntry?.id || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setCurrent = async (req, res) => {
  try {
    const { queueId } = req.body;

    if (!queueId) {
      return res.status(400).json({ message: 'queueId is required' });
    }

    const currentEntry = await setCurrentQueueEntry(queueId);
    if (!currentEntry) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    await createAuditLog(req, {
      action: 'queue.set_current',
      entityType: 'judging_queue',
      entityId: currentEntry.id,
      metadata: {
        eventId: currentEntry.event_id,
        participantId: currentEntry.participant_id,
      },
    });

    await emitQueueRefresh();

    res.json({
      message: 'Current queue entry updated successfully',
      currentQueueId: currentEntry.id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
