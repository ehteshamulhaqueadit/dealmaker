import Message from "../models/messageModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    let requestingUserId = req.user.id;
    const requestingUsername = req.user.username;

    // Fallback for tokens without user ID
    if (!requestingUserId) {
      const user = await userModel.findOne({
        where: { username: requestingUsername },
      });
      requestingUserId = user.id;
    }

    // Find the message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.senderId !== requestingUserId) {
      return res.status(403).json({
        message: "You can only delete your own messages",
      });
    }

    await message.destroy();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      message: "Error deleting message",
      error: error.message,
    });
  }
};
