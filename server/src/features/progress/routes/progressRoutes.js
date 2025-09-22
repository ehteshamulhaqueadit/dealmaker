import express from "express";
import { authentication } from "../../../middleware/authMiddleware.js";
import { createProgress } from "../controllers/createProgressController.js";
import { getProgress } from "../controllers/getProgressController.js";
import { updateProgressStatus } from "../controllers/updateProgressController.js";
import { markDealComplete } from "../controllers/markDealCompleteController.js";

const router = express.Router();

// Create a new progress item (dealmaker only)
router.post("/", authentication, createProgress);

// Get all progress items for a deal
router.get("/deal/:dealId", authentication, getProgress);

// Update progress status (dealmaker only)
router.put("/:progressId/status", authentication, updateProgressStatus);

// Mark deal as complete (creator and counterpart only)
router.put("/deal/:dealId/complete", authentication, markDealComplete);

export default router;
