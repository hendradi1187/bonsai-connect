module.exports = (sequelize, DataTypes) => {
  const JudgeAssignment = sequelize.define('JudgeAssignment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    session_label: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'judge_assignments',
    timestamps: true
  });

  JudgeAssignment.associate = (models) => {
    JudgeAssignment.belongsTo(models.User, { foreignKey: 'user_id' });
    JudgeAssignment.belongsTo(models.Event, { foreignKey: 'event_id' });
  };

  return JudgeAssignment;
};
