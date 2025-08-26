import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

const biddingModel = db_connection.define("Bidding", {
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
  dealmaker: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: userModel,
      key: "username",
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
});

export default biddingModel;
