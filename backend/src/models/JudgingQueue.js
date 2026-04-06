module.exports = (sequelize, DataTypes) => {
  const JudgingQueue = sequelize.define('JudgingQueue', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    participant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    judging_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    queue_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('waiting', 'current', 'done'),
      defaultValue: 'waiting'
    }
  }, {
    tableName: 'judging_queue',
    timestamps: true
  });

  JudgingQueue.associate = (models) => {
    JudgingQueue.belongsTo(models.Event, { foreignKey: 'event_id' });
    JudgingQueue.belongsTo(models.Participant, { foreignKey: 'participant_id' });
  };

  return JudgingQueue;
};
