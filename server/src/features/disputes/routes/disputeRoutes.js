import express from "express";
import { authentication } from "../../../middleware/authMiddleware.js";
import { createDispute } from "../controllers/createDisputeController.js";
import { getDisputes } from "../controllers/getDisputesController.js";
import { resolveDispute } from "../controllers/resolveDisputeController.js";

const router = express.Router();

// Create a new dispute (only deal creator and counterpart)
router.post("/", authentication, createDispute);

// Get all disputes for a deal
router.get("/deal/:dealId", authentication, getDisputes);

// Resolve a dispute (only dealmaker)
router.put("/:disputeId/resolve", authentication, resolveDispute);

export default router;
