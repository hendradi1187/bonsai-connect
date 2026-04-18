module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    certificate_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    participant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    bonsai_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tree_species: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING
    },
    rank: {
      type: DataTypes.INTEGER
    },
    event_name: {
      type: DataTypes.STRING
    },
    issue_date: {
      type: DataTypes.DATEONLY
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'certificates',
    timestamps: true
  });

  Certificate.associate = (models) => {
    Certificate.belongsTo(models.Participant, { foreignKey: 'participant_id', constraints: false });
    Certificate.belongsTo(models.Event, { foreignKey: 'event_id', constraints: false });
    Certificate.belongsTo(models.Bonsai, { foreignKey: 'bonsai_id', constraints: false });
  };

  return Certificate;
};
