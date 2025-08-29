import { RequestDealmaker } from "../models/requestDealmakerModel.js";
import dealModel from "../../deals/models/dealsModel.js";

export const sendRequestController = async (req, res) => {
  const { receiverUsername, dealId, message } = req.body;
  const sender = req.user.username;

  try {
    const deal = await dealModel.findByPk(dealId);

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    if (deal.dealmaker) {
      return res
        .status(409)
        .json({ error: "This deal already has a dealmaker." });
    }

    if (
      receiverUsername === deal.dealer_creator ||
      receiverUsername === deal.dealer_joined
    ) {
      return res
        .status(409)
        .json({ error: "This user is already a participant in the deal." });
    }

    const existingRequest = await RequestDealmaker.findOne({
      where: {
        sender,
        receiver: receiverUsername,
        dealId,
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        error: "A request for this deal to this user already exists.",
      });
    }

    const newRequest = await RequestDealmaker.create({
      sender,
      receiver: receiverUsername,
      dealId,
      message,
    });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error sending request:", error); // Added for debugging
    res.status(500).json({ error: "Failed to send request" });
  }
};

export const cancelRequestController = async (req, res) => {
  const { requestId } = req.params;
  const sender = req.user.username;

  try {
    const request = await RequestDealmaker.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.sender !== sender) {
      return res
        .status(403)
        .json({ error: "You are not authorized to cancel this request" });
    }

    await request.destroy();
    res.status(200).json({ message: "Request cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel request" });
  }
};
