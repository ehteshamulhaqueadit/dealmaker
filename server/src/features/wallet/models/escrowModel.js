import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import { userModel } from "../../auth/models/authModel.js";
import dealModel from "../../deals/models/dealsModel.js";

const Escrow = db_connection.define(
  "Escrow",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: dealModel,
        key: "id",
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    creatorContribution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    counterpartContribution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    creatorPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    counterpartPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "locked", "released"),
      defaultValue: "pending",
      allowNull: false,
    },
    dealmaker: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    releasedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "escrows",
    timestamps: true,
  }
);

// Define associations
Escrow.belongsTo(dealModel, {
  foreignKey: "dealId",
  as: "deal",
});

dealModel.hasOne(Escrow, {
  foreignKey: "dealId",
  as: "escrow",
});

export default Escrow;
