import Dispute from "../models/disputeModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const getDisputes = async (req, res) => {
  try {
    const { dealId } = req.params;
    const requestingUsername = req.user.username;

    // Check if the deal exists
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check if the user is authorized to view disputes for this deal
    const isAuthorized =
      deal.dealer_creator === requestingUsername ||
      deal.dealer_joined === requestingUsername ||
      deal.dealmaker === requestingUsername;

    if (!isAuthorized) {
      return res.status(403).json({
        message: "You are not authorized to view disputes for this deal",
      });
    }

    const disputes = await Dispute.findAll({
      where: { dealId },
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
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(disputes);
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({
      message: "Error fetching disputes",
      error: error.message,
    });
  }
};
