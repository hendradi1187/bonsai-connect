module.exports = (sequelize, DataTypes) => {
  const Scoring = sequelize.define('Scoring', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    participant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    judging_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nebari_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    trunk_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    branch_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    composition_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    pot_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    // New Criteria
    appearance_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    movement_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    harmony_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    maturity_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    judge_note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    judge_id: {
      type: DataTypes.UUID,
      allowNull: true, // null = aggregate row; UUID = per-judge row
    },
    total_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }
  }, {
    tableName: 'scoring',
    timestamps: true
  });

  Scoring.associate = (models) => {
    Scoring.belongsTo(models.Participant, { foreignKey: 'participant_id' });
    Scoring.belongsTo(models.User, { foreignKey: 'judge_id', as: 'Judge', constraints: false });
  };

  return Scoring;
};
