const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Event = require('./Event');
const Participant = require('./Participant');
const Bonsai = require('./Bonsai');
const JudgingQueue = require('./JudgingQueue');
const Scoring = require('./Scoring');
const EventRuntime = require('./EventRuntime');

// Define models
const models = {
  Event: Event(sequelize, DataTypes),
  Participant: Participant(sequelize, DataTypes),
  Bonsai: Bonsai(sequelize, DataTypes),
  JudgingQueue: JudgingQueue(sequelize, DataTypes),
  Scoring: Scoring(sequelize, DataTypes),
  EventRuntime: EventRuntime(sequelize, DataTypes),
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
