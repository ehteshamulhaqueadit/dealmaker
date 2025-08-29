import Dispute from "../models/disputeModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { resolution } = req.body;
    let resolvedBy = req.user.id;
    const resolvedByUsername = req.user.username;

    // Fallback for tokens without user ID
    if (!resolvedBy) {
      const user = await userModel.findOne({
        where: { username: resolvedByUsername },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      resolvedBy = user.id;
    }

    if (!resolution) {
      return res.status(400).json({
        message: "Resolution is required",
      });
    }

    // Find the dispute
    const dispute = await Dispute.findByPk(disputeId, {
      include: [
        {
          model: dealModel,
          as: "deal",
        },
      ],
    });

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Only the dealmaker can resolve disputes
    if (dispute.deal.dealmaker !== resolvedByUsername) {
      return res.status(403).json({
        message: "Only the assigned dealmaker can resolve disputes",
      });
    }

    // Check if dispute is already resolved
    if (dispute.status === "resolved") {
      return res.status(400).json({
        message: "Dispute is already resolved",
      });
    }

    // Update dispute with resolution
    await dispute.update({
      status: "resolved",
      resolution,
      resolvedBy,
      resolvedByUsername,
      resolvedAt: new Date(),
    });

    // Return updated dispute with user information
    const updatedDispute = await Dispute.findByPk(disputeId, {
      include: [
        {
          model: userModel,
          as: "raiser",
          attributes: ["id", "username", "full_name"],
        },
        {
          model: userModel,
          as: "resolver",
          attributes: ["id", "username", "full_name"],
        },
      ],
    });

    res.status(200).json(updatedDispute);
  } catch (error) {
    console.error("Error resolving dispute:", error);
    res.status(500).json({
      message: "Error resolving dispute",
      error: error.message,
    });
  }
};
