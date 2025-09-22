import biddingModel from "../models/biddingModel.js";

export const getBidByDealId = async (req, res) => {
  try {
    const { dealId } = req.params;
    const bids = await biddingModel.findAll({ where: { dealId } });
    res.status(200).json(bids);
  } catch (error) {
    console.error("Error fetching bids by dealId:", error);
    res.status(500).json({ error: "Failed to fetch bids." });
  }
};
