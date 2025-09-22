import biddingModel from "../model/biddingModels.js";

export const deleteBid = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await biddingModel.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Bid not found." });
    }
    res.status(200).json({ message: "Bid deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bid." });
  }
};
