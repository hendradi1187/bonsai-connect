const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Event = require('./Event');
const Participant = require('./Participant');
const Bonsai = require('./Bonsai');
const JudgingQueue = require('./JudgingQueue');
const Scoring = require('./Scoring');
const EventRuntime = require('./EventRuntime');
const User = require('./User');
const AuditLog = require('./AuditLog');
const JudgeAssignment = require('./JudgeAssignment');
const Certificate = require('./Certificate');

// Define models
const models = {
  Event: Event(sequelize, DataTypes),
  Participant: Participant(sequelize, DataTypes),
  Bonsai: Bonsai(sequelize, DataTypes),
  JudgingQueue: JudgingQueue(sequelize, DataTypes),
  Scoring: Scoring(sequelize, DataTypes),
  EventRuntime: EventRuntime(sequelize, DataTypes),
  User: User(sequelize, DataTypes),
  AuditLog: AuditLog(sequelize, DataTypes),
  JudgeAssignment: JudgeAssignment(sequelize, DataTypes),
  Certificate: Certificate(sequelize, DataTypes),
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
