import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import { userModel } from "../../auth/models/authModel.js";
import dealModel from "../../deals/models/dealsModel.js";

const Message = db_connection.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
        key: "id",
      },
    },
    senderUsername: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: userModel,
        key: "username",
      },
    },
    dealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: dealModel,
        key: "id",
      },
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt
  }
);

// Relationships
userModel.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(userModel, { foreignKey: "senderId", as: "sender" });

dealModel.hasMany(Message, { foreignKey: "dealId", as: "messages" });
Message.belongsTo(dealModel, { foreignKey: "dealId", as: "deal" });

export default Message;
