import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import { userModel } from "./authModel.js";

export const userDataModel = db_connection.define(
  "UserData",
  {
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

userModel.hasOne(userDataModel, {
  foreignKey: "username",
  sourceKey: "username",
});
userDataModel.belongsTo(userModel, {
  foreignKey: "username",
  targetKey: "username",
});
