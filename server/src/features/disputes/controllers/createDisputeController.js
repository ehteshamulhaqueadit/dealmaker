import Dispute from "../models/disputeModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const createDispute = async (req, res) => {
  try {
    const { dealId, title, description } = req.body;
    let raisedBy = req.user.id;
    const raisedByUsername = req.user.username;

    // Fallback for tokens without user ID
    if (!raisedBy) {
      const user = await userModel.findOne({
        where: { username: raisedByUsername },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      raisedBy = user.id;
    }

    if (!title || !description || !dealId) {
      return res.status(400).json({
        message: "Title, description, and dealId are required",
      });
    }

    // Check if the deal exists
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Only deal creator and deal counterpart can raise disputes
    const canRaiseDispute =
      deal.dealer_creator === raisedByUsername ||
      deal.dealer_joined === raisedByUsername;

    if (!canRaiseDispute) {
      return res.status(403).json({
        message: "Only deal creator and counterpart can raise disputes",
      });
    }

    const dispute = await Dispute.create({
      dealId,
      raisedBy,
      raisedByUsername,
      title,
      description,
    });

    // Include user information in response
    const disputeWithUser = await Dispute.findByPk(dispute.id, {
      include: [
        {
          model: userModel,
          as: "raiser",
          attributes: ["id", "username", "full_name"],
        },
      ],
    });

    res.status(201).json(disputeWithUser);
  } catch (error) {
    console.error("Error creating dispute:", error);
    res.status(500).json({
      message: "Error creating dispute",
      error: error.message,
    });
  }
};
