const { Op } = require('sequelize');
const { JudgeAssignment } = require('../models');

const getAssignedEventIds = async (userId) => {
  const assignments = await JudgeAssignment.findAll({
    where: {
      user_id: userId,
      is_active: true,
    },
    attributes: ['event_id'],
  });

  return assignments.map((assignment) => assignment.event_id);
};

const getParticipantScope = async (user) => {
  if (!user || user.role === 'superadmin' || user.role === 'admin') {
    return {};
  }

  const eventIds = await getAssignedEventIds(user.id);
  if (eventIds.length === 0) {
    return { event_id: { [Op.in]: [] } };
  }

  return {
    event_id: {
      [Op.in]: eventIds,
    },
  };
};

const assertParticipantAccess = async (user, participant) => {
  if (!user || user.role === 'superadmin' || user.role === 'admin') {
    return true;
  }

  const eventIds = await getAssignedEventIds(user.id);
  return eventIds.includes(participant.event_id);
};

module.exports = {
  getAssignedEventIds,
  getParticipantScope,
  assertParticipantAccess,
};
