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
  as: "profile",
  foreignKey: "username",
  sourceKey: "username",
});
userDataModel.belongsTo(userModel, {
  as: "user",
  foreignKey: "username",
  targetKey: "username",
});

class User {
  constructor(username) {
    this.username = username;
    authmodel
      .findOne({
        where: { username: this.username },
        attributes: ["username", "email"],
      })
      .then((user) => {
        if (user) {
          this.name = user.full_name;
          this.email = user.email;
        } else {
          throw new Error("User not found");
        }
      });
  }
}
