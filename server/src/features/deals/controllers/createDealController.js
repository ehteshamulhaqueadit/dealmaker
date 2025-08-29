import dealModel from "../models/dealsModel.js";
import socketService from "../../../utils/socketService.js";

export const createDealController = async (req, res) => {
  const dealer_creator = req.user.username;

  const { title, description, budget, timeline } = req.body;

  try {
    const newDeal = await dealModel.create({
      title,
      description,
      dealer_creator,
      budget,
      timeline,
    });

    // Broadcast real-time update
    socketService.broadcastDealUpdate(newDeal.id, newDeal, "created");

    res.status(200).json(newDeal);
  } catch (error) {
    res.status(500).json({ error: "Failed to create deal" });
  }
};
