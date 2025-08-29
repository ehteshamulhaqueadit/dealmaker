import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import { userModel } from "../../auth/models/authModel.js";
import dealModel from "../../deals/models/dealsModel.js";

const Transaction = db_connection.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
        key: "id",
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "deposit",
        "withdraw",
        "escrow_lock",
        "escrow_release",
        "payment_received"
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    dealId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: dealModel,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "completed",
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
  }
);

// Define associations
Transaction.belongsTo(userModel, {
  foreignKey: "userId",
  as: "user",
});

Transaction.belongsTo(dealModel, {
  foreignKey: "dealId",
  as: "deal",
});

userModel.hasMany(Transaction, {
  foreignKey: "userId",
  as: "transactions",
});

dealModel.hasMany(Transaction, {
  foreignKey: "dealId",
  as: "transactions",
});

export default Transaction;
