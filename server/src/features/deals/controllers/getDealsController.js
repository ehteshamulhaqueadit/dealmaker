import dealModel from "../models/dealsModel.js";
import { Op } from "sequelize"; // Import Op for Sequelize operators

export const getDealsController = async (req, res) => {
  const keyword = req.params.keyword;
  try {
    const deals = await dealModel.findAll({
      where: {
        title: {
          [Op.like]: `%${keyword}%`,
        },
      },
      order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
    });
    res.status(200).json(deals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve deals" });
  }
};
