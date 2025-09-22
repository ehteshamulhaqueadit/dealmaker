import dealModel from "../models/dealsModel.js";
import { Op } from "sequelize"; // Import Op for Sequelize operators

export const getDealsController = async (req, res) => {
  const keyword = req.params.keyword || ""; // Default to an empty string if no keyword is provided
  try {
    const deals = await dealModel.findAll({
      where: keyword
        ? {
            title: {
              [Op.like]: `%${keyword}%`,
            },
          }
        : {}, // If no keyword, fetch all deals
      order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
    });

    // Map the deals to include `creatorId` alias
    const formattedDeals = deals.map((deal) => ({
      ...deal.toJSON(),
      creatorId: deal.dealer_creator, // Alias dealer_creator as creatorId
    }));

    res.status(200).json(formattedDeals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve deals" });
  }
};
