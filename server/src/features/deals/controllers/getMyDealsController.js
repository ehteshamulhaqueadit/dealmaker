import dealModel from "../models/dealsModel.js";
import { Op } from "sequelize";

export const getMyDealsController = async (req, res) => {
  const username = req.user.username;

  try {
    const myDeals = await dealModel.findAll({
      where: {
        [Op.or]: [{ dealer_creator: username }, { dealer_joined: username }],
      },
      order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
    });
    res.status(200).json(myDeals);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve deals" });
  }
};
