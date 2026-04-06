module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define('Participant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: 'Depok'
    },
    registration_number: {
      type: DataTypes.STRING,
      unique: true
    },
    judging_number: {
      type: DataTypes.STRING,
      unique: true
    },
    judging_number_status: {
      type: DataTypes.ENUM('reserved', 'confirmed'),
      defaultValue: 'reserved'
    },
    status: {
      type: DataTypes.ENUM('registered', 'checked_in', 'waiting', 'judging', 'judged'),
      defaultValue: 'registered'
    }
  }, {
    tableName: 'participants',
    timestamps: true
  });

  Participant.associate = (models) => {
    Participant.belongsTo(models.Event, { foreignKey: 'event_id' });
    Participant.hasMany(models.Bonsai, { foreignKey: 'owner_id' });
    Participant.hasOne(models.Scoring, { foreignKey: 'participant_id' });
  };

  return Participant;
};
