import Message from "../models/messageModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const getMessagesByDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const requestingUserId = req.user.id;
    const requestingUsername = req.user.username;

    // Check if the deal exists
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check if the user is authorized to view messages in this deal
    // Only deal creator, joined dealer, or assigned dealmaker can view messages
    const isAuthorized =
      deal.dealer_creator === requestingUsername ||
      deal.dealer_joined === requestingUsername ||
      deal.dealmaker === requestingUsername;

    if (!isAuthorized) {
      return res.status(403).json({
        message: "You are not authorized to view messages in this deal",
      });
    }

    const messages = await Message.findAll({
      where: { dealId },
      include: [
        {
          model: userModel,
          as: "sender",
          attributes: ["id", "username", "full_name"],
        },
      ],
      order: [["createdAt", "ASC"]], // Show oldest messages first
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};
