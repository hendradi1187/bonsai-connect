const bcrypt = require('bcryptjs');
const { User } = require('../models');

const defaults = [
  {
    name: process.env.DEFAULT_SUPERADMIN_NAME || 'Super Admin',
    email: (process.env.DEFAULT_SUPERADMIN_EMAIL || 'superadmin@ppbi.local').toLowerCase(),
    password: process.env.DEFAULT_SUPERADMIN_PASSWORD || 'superadmin123',
    role: 'superadmin',
  },
  {
    name: process.env.DEFAULT_ADMIN_NAME || 'Admin Event',
    email: (process.env.DEFAULT_ADMIN_EMAIL || 'admin@ppbi.local').toLowerCase(),
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin12345',
    role: 'admin',
  },
  {
    name: process.env.DEFAULT_JUDGE_NAME || 'Juri Utama',
    email: (process.env.DEFAULT_JUDGE_EMAIL || 'juri@ppbi.local').toLowerCase(),
    password: process.env.DEFAULT_JUDGE_PASSWORD || 'juri12345',
    role: 'juri',
  },
];

const ensureDefaultUsers = async () => {
  for (const account of defaults) {
    const existing = await User.findOne({ where: { email: account.email } });
    if (existing) {
      continue;
    }

    await User.create({
      name: account.name,
      email: account.email,
      password_hash: await bcrypt.hash(account.password, 10),
      role: account.role,
      is_active: true,
    });
  }
};

module.exports = {
  ensureDefaultUsers,
};
