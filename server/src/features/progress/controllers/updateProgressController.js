import Progress from "../models/progressModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const updateProgressStatus = async (req, res) => {
  try {
    const { progressId } = req.params;
    const { status } = req.body;
    let completedBy = req.user.id;
    const completedByUsername = req.user.username;

    // Fallback for tokens without user ID
    if (!completedBy) {
      const user = await userModel.findOne({
        where: { username: completedByUsername },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      completedBy = user.id;
    }

    if (!status || !["pending", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Valid status is required (pending, in_progress, completed)",
      });
    }

    // Find the progress item
    const progress = await Progress.findByPk(progressId, {
      include: [
        {
          model: dealModel,
          as: "deal",
        },
      ],
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress item not found" });
    }

    // Only dealmaker can update progress status
    if (progress.deal.dealmaker !== completedByUsername) {
      return res.status(403).json({
        message: "Only the assigned dealmaker can update progress status",
      });
    }

    // Update progress
    const updateData = { status };

    if (status === "completed") {
      updateData.completedBy = completedBy;
      updateData.completedByUsername = completedByUsername;
      updateData.completedAt = new Date();
    } else {
      updateData.completedBy = null;
      updateData.completedByUsername = null;
      updateData.completedAt = null;
    }

    await progress.update(updateData);

    // Return updated progress with user information
    const updatedProgress = await Progress.findByPk(progressId, {
      include: [
        {
          model: userModel,
          as: "completedByUser",
          attributes: ["id", "username", "full_name"],
        },
      ],
    });

    res.status(200).json(updatedProgress);
  } catch (error) {
    console.error("Error updating progress status:", error);
    res.status(500).json({
      message: "Error updating progress status",
      error: error.message,
    });
  }
};
