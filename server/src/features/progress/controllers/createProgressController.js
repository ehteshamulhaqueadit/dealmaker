import Progress from "../models/progressModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const createProgress = async (req, res) => {
  try {
    const { dealId, title, description } = req.body;
    const requestingUsername = req.user.username;

    // Check if the deal exists
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Only dealmaker can create progress items
    if (deal.dealmaker !== requestingUsername) {
      return res.status(403).json({
        message: "Only the assigned dealmaker can create progress items",
      });
    }

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    // Get the next order number
    const maxOrder = await Progress.max("order", { where: { dealId } });
    const order = (maxOrder || 0) + 1;

    const progress = await Progress.create({
      dealId,
      title,
      description,
      order,
    });

    res.status(201).json(progress);
  } catch (error) {
    console.error("Error creating progress:", error);
    res.status(500).json({
      message: "Error creating progress",
      error: error.message,
    });
  }
};
