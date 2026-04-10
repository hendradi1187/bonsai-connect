const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { signToken } = require('../config/auth');
const { createAuditLog } = require('../services/auditService');

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
  lastLoginAt: user.last_login_at,
  createdAt: user.createdAt,
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: {
        email: String(email).trim().toLowerCase(),
      },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.last_login_at = new Date();
    await user.save();

    await createAuditLog(req, {
      actorUserId: user.id,
      action: 'auth.login',
      entityType: 'auth_session',
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
      },
    });

    res.json({
      token: signToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.is_active) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  await createAuditLog(req, {
    action: 'auth.logout',
    entityType: 'auth_session',
    entityId: req.user.id,
    metadata: {
      email: req.user.email,
      role: req.user.role,
    },
  });

  res.json({ message: 'Logged out' });
};
