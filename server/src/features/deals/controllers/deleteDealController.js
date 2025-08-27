import dealModel from "../models/dealsModel.js";
import biddingModel from "../../bidding/model/biddingModels.js";

export const deleteDealController = async (req, res) => {
  const { id } = req.params;
  // first get the deal by the id
  const deal = await dealModel.findByPk(id);
  if (!deal) {
    return res.status(404).json({ message: "Deal not found" });
  }
  if (deal.dealer_creator !== req.user.username) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  try {
    // Delete related rows in the Biddings table
    await biddingModel.destroy({ where: { dealId: id } });

    // Delete the deal
    const deletedDeal = await dealModel.destroy({ where: { id } });
    if (deletedDeal) {
      res.status(200).json({ message: "Deal deleted successfully" });
    } else {
      res.status(404).json({ message: "Deal not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete deal" });
  }
};
