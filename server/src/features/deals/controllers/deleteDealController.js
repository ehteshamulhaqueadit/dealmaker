import dealModel from "../models/dealsModel.js";

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
    const deletedDeal = await dealModel.destroy({ where: { id } });
    if (deletedDeal) {
      res.status(200).json({ message: "Deal deleted successfully" });
    } else {
      res.status(404).json({ message: "Deal not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete deal" });
  }
};
