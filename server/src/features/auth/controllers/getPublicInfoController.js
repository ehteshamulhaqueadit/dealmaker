import { userModel } from "../models/authModel.js";
import { Op } from "sequelize";
import dealModel from "../../deals/models/dealsModel.js";

export const getPublicInfoController = async (req, res) => {
  const { keyword } = req.query; // Changed from req.params to req.query
  const { dealId } = req.query;
  const loggedInUser = req.user.username;

  try {
    let usersToExclude = [loggedInUser];

    if (dealId) {
      const deal = await dealModel.findByPk(dealId);
      if (deal) {
        if (deal.dealer_creator) {
          usersToExclude.push(deal.dealer_creator);
        }
        if (deal.dealer_joined) {
          usersToExclude.push(deal.dealer_joined);
        }
      }
    }

    let whereClause = {
      username: {
        [Op.notIn]: usersToExclude,
      },
    };

    if (keyword) {
      whereClause[Op.or] = [
        {
          username: {
            [Op.like]: `%${keyword}%`,
          },
        },
        {
          full_name: {
            [Op.like]: `%${keyword}%`,
          },
        },
      ];
    }

    const users = await userModel.findAll({
      where: whereClause,
      attributes: ["username", "full_name", "createdAt"],
      order: [["createdAt", "DESC"]], // Order by creation date
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch public user info:", error);
    res.status(500).json({ error: "Failed to fetch public user info" });
  }
};
