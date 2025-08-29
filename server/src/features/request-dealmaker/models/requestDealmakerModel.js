import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import { userModel } from "../../auth/models/authModel.js";
import dealModel from "../../deals/models/dealsModel.js";

const RequestDealmaker = db_connection.define(
  "RequestDealmaker",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: userModel,
        key: "username",
      },
    },
    receiver: {
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
    timestamps: true,
  }
);

RequestDealmaker.belongsTo(userModel, { as: "Sender", foreignKey: "sender" });
RequestDealmaker.belongsTo(userModel, {
  as: "Receiver",
  foreignKey: "receiverUsername",
  targetKey: "username",
});
RequestDealmaker.belongsTo(dealModel, { as: "deal", foreignKey: "dealId" });

dealModel.hasMany(RequestDealmaker, {
  foreignKey: "dealId",
  as: "requests",
});

export { RequestDealmaker };
