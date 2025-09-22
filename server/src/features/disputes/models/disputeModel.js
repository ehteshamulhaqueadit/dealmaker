import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import { userModel } from "../../auth/models/authModel.js";
import dealModel from "../../deals/models/dealsModel.js";

const Dispute = db_connection.define(
  "Dispute",
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
    raisedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
        key: "id",
      },
    },
    raisedByUsername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("open", "resolved", "closed"),
      defaultValue: "open",
      allowNull: false,
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: userModel,
        key: "id",
      },
    },
    resolvedByUsername: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "disputes",
    timestamps: true,
  }
);

// Define associations
Dispute.belongsTo(userModel, {
  foreignKey: "raisedBy",
  as: "raiser",
});

Dispute.belongsTo(userModel, {
  foreignKey: "resolvedBy",
  as: "resolver",
});

Dispute.belongsTo(dealModel, {
  foreignKey: "dealId",
  as: "deal",
});

dealModel.hasMany(Dispute, {
  foreignKey: "dealId",
  as: "disputes",
});

userModel.hasMany(Dispute, {
  foreignKey: "raisedBy",
  as: "raisedDisputes",
});

userModel.hasMany(Dispute, {
  foreignKey: "resolvedBy",
  as: "resolvedDisputes",
});

export default Dispute;
