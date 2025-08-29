import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const markDealComplete = async (req, res) => {
  try {
    const { dealId } = req.params;
    const requestingUsername = req.user.username;

    // Check if the deal exists
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Only deal creator and counterpart can mark deal as complete
    const isCreator = deal.dealer_creator === requestingUsername;
    const isCounterpart = deal.dealer_joined === requestingUsername;

    if (!isCreator && !isCounterpart) {
      return res.status(403).json({
        message: "Only deal creator and counterpart can mark deal as complete",
      });
    }

    // Check if deal is already completed
    if (deal.is_completed) {
      return res.status(400).json({
        message: "Deal is already completed",
      });
    }

    // Update completion status
    const updateData = {};

    if (isCreator) {
      updateData.completed_by_creator = true;
    }

    if (isCounterpart) {
      updateData.completed_by_counterpart = true;
    }

    // Check if both parties have marked as complete
    const willBeCompleted =
      (updateData.completed_by_creator || deal.completed_by_creator) &&
      (updateData.completed_by_counterpart || deal.completed_by_counterpart);

    if (willBeCompleted) {
      updateData.is_completed = true;
      updateData.completion_date = new Date();
    }

    await deal.update(updateData);

    // Return updated deal
    const updatedDeal = await dealModel.findByPk(dealId);

    res.status(200).json({
      message: willBeCompleted
        ? "Deal has been marked as completed by both parties!"
        : "Your completion status has been recorded. Waiting for the other party.",
      deal: updatedDeal,
      isCompleted: willBeCompleted,
    });
  } catch (error) {
    console.error("Error marking deal complete:", error);
    res.status(500).json({
      message: "Error marking deal complete",
      error: error.message,
    });
  }
};
