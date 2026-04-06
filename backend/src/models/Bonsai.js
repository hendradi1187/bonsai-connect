module.exports = (sequelize, DataTypes) => {
  const Bonsai = sequelize.define('Bonsai', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    species: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size_category: {
      type: DataTypes.STRING,
      defaultValue: 'Large'
    },
    photo_url: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'bonsai',
    timestamps: true
  });

  Bonsai.associate = (models) => {
    Bonsai.belongsTo(models.Participant, { foreignKey: 'owner_id' });
  };

  return Bonsai;
};
