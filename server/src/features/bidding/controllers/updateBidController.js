import biddingModel from "../model/biddingModels.js";
import { validate as isUuid } from "uuid";

export const updateBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    // Validate if the id is a valid UUID
    if (!isUuid(id)) {
      return res.status(400).json({ error: "Invalid bid ID format." });
    }

    const updatedBid = await biddingModel.update({ price }, { where: { id } });
    if (updatedBid[0] === 0) {
      return res.status(404).json({ error: "Bid not found." });
    }

    res.status(200).json({ message: "Bid updated successfully." });
  } catch (error) {
    console.error("Failed to update bid", error);
    res.status(500).json({ error: "Failed to update bid." });
  }
};
