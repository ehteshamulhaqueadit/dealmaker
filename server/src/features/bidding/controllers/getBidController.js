import biddingModel from "../model/biddingModels.js";

export const getBid = async (req, res) => {
  try {
    const { id } = req.params;
    const bid = await biddingModel.findByPk(id);
    if (!bid) {
      return res.status(404).json({ error: "Bid not found." });
    }
    res.status(200).json(bid);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bid." });
  }
};
