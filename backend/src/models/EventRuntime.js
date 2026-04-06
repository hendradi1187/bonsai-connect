module.exports = (sequelize, DataTypes) => {
  const EventRuntime = sequelize.define('EventRuntime', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    current_judging_number: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('running', 'paused'),
      defaultValue: 'paused'
    }
  }, {
    tableName: 'event_runtime',
    timestamps: true
  });

  EventRuntime.associate = (models) => {
    EventRuntime.belongsTo(models.Event, { foreignKey: 'event_id' });
  };

  return EventRuntime;
};
