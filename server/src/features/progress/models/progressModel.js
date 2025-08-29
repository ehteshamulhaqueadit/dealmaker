import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import { userModel } from "../../auth/models/authModel.js";
import dealModel from "../../deals/models/dealsModel.js";

const Progress = db_connection.define(
  "Progress",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: dealModel,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed"),
      defaultValue: "pending",
      allowNull: false,
    },
    completedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: userModel,
        key: "id",
      },
    },
    completedByUsername: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "progress",
    timestamps: true,
  }
);

// Define associations
Progress.belongsTo(userModel, {
  foreignKey: "completedBy",
  as: "completedByUser",
});

Progress.belongsTo(dealModel, {
  foreignKey: "dealId",
  as: "deal",
});

dealModel.hasMany(Progress, {
  foreignKey: "dealId",
  as: "progress",
});

userModel.hasMany(Progress, {
  foreignKey: "completedBy",
  as: "completedProgress",
});

export default Progress;
