import biddingModel from "../model/biddingModels.js";

export const getAllBids = async (req, res) => {
  try {
    const bids = await biddingModel.findAll();
    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bids." });
  }
};
