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
    },
    passport_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    height_cm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    estimated_age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    style: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passport_status: {
      type: DataTypes.ENUM('registered', 'approved', 'judged'),
      defaultValue: 'registered'
    },
    accessories: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Perlengkapan pendamping: ["Meja","Batu","Rumput Pendamping"]'
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
