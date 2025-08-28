import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";

// Updated id field to auto-increment
const dealModel = db_connection.define(
  "Deal",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dealer_creator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dealer_joined: {
      type: DataTypes.STRING,
      allowNull: true, // Initially null until a dealer joins
    },
    dealmaker: {
      type: DataTypes.STRING,
      allowNull: true, // Initially null until a dealmaker is assigned
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    timeline: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    selected_bid_by_creator: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    selected_bid_by_dealer: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt fields
  }
);

export default dealModel;
