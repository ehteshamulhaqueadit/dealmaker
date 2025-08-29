import dealModel from "../models/dealsModel.js";
import Escrow from "../../wallet/models/escrowModel.js";
import socketService from "../../../utils/socketService.js";

//controller for leaving a deal as dealer
export const leaveDealAsDealerController = async (req, res) => {
  const dealId = req.params.id;
  const username = req.user.username;
  try {
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    // Logic to remove user as dealer for the deal
    if (deal.dealer_joined !== username) {
      return res
        .status(400)
        .json({ error: "You are not a dealer in this deal" });
    }

    // Check if deal has escrow payments (prevents leaving)
    if (deal.dealmaker) {
      const escrow = await Escrow.findOne({ where: { dealId } });
      if (escrow && (escrow.creatorPaid || escrow.counterpartPaid)) {
        return res.status(400).json({
          error:
            "Cannot leave deal - escrow payment has been made. Deal is now protected.",
        });
      }
    }

    await deal.update({ dealer_joined: null });

    // Get updated deal data
    const updatedDeal = await dealModel.findByPk(dealId);

    // Broadcast real-time update
    socketService.broadcastDealUpdate(dealId, updatedDeal, "left");

    res.status(200).json({ message: "User removed as dealer successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to leave deal as dealer" });
  }
};
