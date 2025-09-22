import { DataTypes } from "sequelize";
import { db_connection } from "../../../../config/db_connection.js";
import { userModel } from "../../auth/models/authModel.js";
import dealModel from "../../deals/models/dealsModel.js";

const Review = db_connection.define(
  "Review",
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
    reviewerUsername: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: userModel,
        key: "username",
      },
    },
    reviewedUsername: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: userModel,
        key: "username",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dealTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["dealId", "reviewerUsername", "reviewedUsername"],
        name: "unique_review_per_deal_pair",
      },
    ],
  }
);

// Define associations
Review.belongsTo(userModel, {
  foreignKey: "reviewerUsername",
  targetKey: "username",
  as: "reviewer",
});

Review.belongsTo(userModel, {
  foreignKey: "reviewedUsername",
  targetKey: "username",
  as: "reviewed",
});

Review.belongsTo(dealModel, {
  foreignKey: "dealId",
  as: "deal",
});

export default Review;
