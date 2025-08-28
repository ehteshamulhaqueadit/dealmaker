import { DataTypes } from "sequelize";
import { db_connection as sequelize } from "../../../../config/db_connection.js";
import Deal from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

const Bidding = sequelize.define(
  "Bidding",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dealId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Deal,
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
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

Deal.hasMany(Bidding, { foreignKey: "dealId" });
Bidding.belongsTo(Deal, { foreignKey: "dealId" });

userModel.hasMany(Bidding, { foreignKey: "dealmaker" });
Bidding.belongsTo(userModel, { foreignKey: "dealmaker" });

export default Bidding;
