module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: 'Depok'
    },
    description: {
      type: DataTypes.TEXT
    },
    start_date: {
      type: DataTypes.DATE
    },
    end_date: {
      type: DataTypes.DATE
    },
    publish_at: {
      type: DataTypes.DATE
    },
    registration_open_at: {
      type: DataTypes.DATE
    },
    registration_close_at: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'finished'),
      defaultValue: 'draft'
    }
  }, {
    tableName: 'events',
    timestamps: true
  });

  Event.associate = (models) => {
    Event.hasMany(models.Participant, { foreignKey: 'event_id' });
    Event.hasMany(models.JudgingQueue, { foreignKey: 'event_id' });
    Event.hasOne(models.EventRuntime, { foreignKey: 'event_id' });
    Event.hasMany(models.JudgeAssignment, { foreignKey: 'event_id' });
  };

  return Event;
};
