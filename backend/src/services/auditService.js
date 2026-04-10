const { AuditLog } = require('../models');

const extractIpAddress = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

const createAuditLog = async (req, {
  actorUserId,
  action,
  entityType,
  entityId,
  metadata,
}) => {
  try {
    await AuditLog.create({
      actor_user_id: actorUserId || req.user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || null,
      ip_address: extractIpAddress(req),
      user_agent: req.headers['user-agent'] || null,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

module.exports = {
  createAuditLog,
};
