const bcrypt = require('bcryptjs');
const { Event, User, JudgeAssignment, AuditLog } = require('../models');
const { createAuditLog } = require('../services/auditService');

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
  lastLoginAt: user.last_login_at,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  assignments: user.JudgeAssignments?.map((assignment) => ({
    id: assignment.id,
    eventId: assignment.event_id,
    eventName: assignment.Event?.name || null,
    sessionLabel: assignment.session_label,
    isActive: assignment.is_active,
    createdAt: assignment.createdAt,
  })) || [],
});

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'ASC']],
      include: [{
        model: JudgeAssignment,
        include: [Event],
      }],
    });

    res.json(users.map(serializeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, and role are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password_hash: await bcrypt.hash(password, 10),
      role,
      is_active: isActive !== false,
    });

    await createAuditLog(req, {
      action: 'user.create',
      entityType: 'user',
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
      },
    });

    res.status(201).json(serializeUser(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: JudgeAssignment,
        include: [Event],
      }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password, role, isActive } = req.body;

    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ where: { email: normalizedEmail } });
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = normalizedEmail;
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.is_active = isActive;
    }

    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    await user.save();

    await createAuditLog(req, {
      action: 'user.update',
      entityType: 'user',
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        passwordReset: Boolean(password),
      },
    });

    res.json(serializeUser(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getJudgeAssignments = async (req, res) => {
  try {
    const assignments = await JudgeAssignment.findAll({
      include: [Event, User],
      order: [['createdAt', 'DESC']],
    });

    res.json(assignments.map((assignment) => ({
      id: assignment.id,
      eventId: assignment.event_id,
      eventName: assignment.Event?.name || null,
      judgeId: assignment.user_id,
      judgeName: assignment.User?.name || null,
      judgeEmail: assignment.User?.email || null,
      sessionLabel: assignment.session_label,
      isActive: assignment.is_active,
      createdAt: assignment.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createJudgeAssignment = async (req, res) => {
  try {
    const { judgeId, eventId, sessionLabel } = req.body;

    if (!judgeId || !eventId) {
      return res.status(400).json({ message: 'judgeId and eventId are required' });
    }

    const judge = await User.findByPk(judgeId);
    if (!judge || judge.role !== 'juri') {
      return res.status(400).json({ message: 'Selected user is not a juri' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const existing = await JudgeAssignment.findOne({
      where: {
        user_id: judgeId,
        event_id: eventId,
        session_label: sessionLabel || null,
        is_active: true,
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Judge assignment already exists' });
    }

    const assignment = await JudgeAssignment.create({
      user_id: judgeId,
      event_id: eventId,
      session_label: sessionLabel || null,
      is_active: true,
    });

    const withRelations = await JudgeAssignment.findByPk(assignment.id, {
      include: [Event, User],
    });

    await createAuditLog(req, {
      action: 'judge_assignment.create',
      entityType: 'judge_assignment',
      entityId: assignment.id,
      metadata: {
        judgeId,
        judgeEmail: judge.email,
        eventId,
        eventName: event.name,
        sessionLabel: sessionLabel || null,
      },
    });

    res.status(201).json({
      id: withRelations.id,
      eventId: withRelations.event_id,
      eventName: withRelations.Event?.name || null,
      judgeId: withRelations.user_id,
      judgeName: withRelations.User?.name || null,
      judgeEmail: withRelations.User?.email || null,
      sessionLabel: withRelations.session_label,
      isActive: withRelations.is_active,
      createdAt: withRelations.createdAt,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateJudgeAssignment = async (req, res) => {
  try {
    const assignment = await JudgeAssignment.findByPk(req.params.id, {
      include: [Event, User],
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const { isActive, sessionLabel } = req.body;

    if (typeof isActive === 'boolean') {
      assignment.is_active = isActive;
    }

    if (sessionLabel !== undefined) {
      assignment.session_label = sessionLabel || null;
    }

    await assignment.save();

    await createAuditLog(req, {
      action: 'judge_assignment.update',
      entityType: 'judge_assignment',
      entityId: assignment.id,
      metadata: {
        judgeId: assignment.user_id,
        eventId: assignment.event_id,
        isActive: assignment.is_active,
        sessionLabel: assignment.session_label,
      },
    });

    res.json({
      id: assignment.id,
      eventId: assignment.event_id,
      eventName: assignment.Event?.name || null,
      judgeId: assignment.user_id,
      judgeName: assignment.User?.name || null,
      judgeEmail: assignment.User?.email || null,
      sessionLabel: assignment.session_label,
      isActive: assignment.is_active,
      createdAt: assignment.createdAt,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'role'],
      }],
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 200),
    });

    res.json(logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      metadata: log.metadata,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.createdAt,
      actor: log.User ? {
        id: log.User.id,
        name: log.User.name,
        email: log.User.email,
        role: log.User.role,
      } : null,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
