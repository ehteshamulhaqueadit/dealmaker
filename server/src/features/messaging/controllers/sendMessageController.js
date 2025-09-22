import Message from "../models/messageModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";
import socketService from "../../../utils/socketService.js";

export const sendMessage = async (req, res) => {
  try {
    const { dealId, content } = req.body;
    let senderId = req.user.id;
    const senderUsername = req.user.username;

    // Fallback: If senderId is not available (older tokens), get it from username
    if (!senderId) {
      const user = await userModel.findOne({
        where: { username: senderUsername },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      senderId = user.id;
    }

    if (!content || !dealId) {
      return res
        .status(400)
        .json({ message: "Content and dealId are required" });
    }

    // Check if the deal exists
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check if the user is authorized to send messages in this deal
    // Only deal creator, joined dealer, or assigned dealmaker can send messages
    const isAuthorized =
      deal.dealer_creator === senderUsername ||
      deal.dealer_joined === senderUsername ||
      deal.dealmaker === senderUsername;

    if (!isAuthorized) {
      return res.status(403).json({
        message: "You are not authorized to send messages in this deal",
      });
    }

    const message = await Message.create({
      dealId,
      senderId,
      senderUsername,
      content,
    });

    // Include sender information in response
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: userModel,
          as: "sender",
          attributes: ["id", "username", "full_name"],
        },
      ],
    });

    // Broadcast real-time message update to all users in the deal room
    socketService.broadcastMessageUpdate(dealId, messageWithSender, "sent");

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};
