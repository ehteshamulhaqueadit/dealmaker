import { Router } from "express";
import { authentication } from "../../../middleware/authMiddleware.js";
import { sendMessage } from "../controllers/sendMessageController.js";
import { getMessagesByDeal } from "../controllers/getMessagesController.js";
import { deleteMessage } from "../controllers/deleteMessageController.js";

const messageRouter = Router();

// Apply authentication middleware to all routes
messageRouter.use(authentication);

// Send a message to a deal
messageRouter.post("/send", sendMessage);

// Get all messages for a specific deal
messageRouter.get("/deal/:dealId", getMessagesByDeal);

// Delete a specific message (only by the sender)
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;
