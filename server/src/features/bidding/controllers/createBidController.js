import biddingModel from "../model/biddingModels.js";
import dealModel from "../../deals/models/dealsModel.js";

export const createBid = async (req, res) => {
  try {
    const { dealId, price } = req.body;
    const dealmaker = req.user.username; // Assuming you have user info in req.user

    // Check if the dealId exists in the Deals table
    const dealExists = await dealModel.findByPk(dealId);
    if (!dealExists) {
      return res
        .status(400)
        .json({ error: "Invalid dealId. Deal does not exist." });
    }

    // Check if the deal is already finalized
    if (dealExists.dealmaker) {
      return res.status(403).json({
        error: "This deal has been finalized and is no longer open for bids.",
      });
    }

    const newBid = await biddingModel.create({ dealId, dealmaker, price });
    res.status(201).json(newBid);
  } catch (error) {
    console.error("Error creating bid:", error);
    res.status(500).json({ error: "Failed to create bid." });
  }
};
