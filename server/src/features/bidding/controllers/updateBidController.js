import biddingModel from "../model/biddingModels.js";

export const updateBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    const updatedBid = await biddingModel.update({ price }, { where: { id } });
    if (updatedBid[0] === 0) {
      return res.status(404).json({ error: "Bid not found." });
    }
    res.status(200).json({ message: "Bid updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update bid." });
  }
};
