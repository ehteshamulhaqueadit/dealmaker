import express from "express";
import { authentication } from "../../../middleware/authMiddleware.js";
import { depositMoney } from "../controllers/depositController.js";
import { getWallet, getTransactions } from "../controllers/walletController.js";
import {
  lockEscrow,
  getEscrowStatus,
} from "../controllers/escrowController.js";

const router = express.Router();

// Deposit money to wallet
router.post("/deposit", authentication, depositMoney);

// Get wallet information
router.get("/", authentication, getWallet);

// Get transaction history
router.get("/transactions", authentication, getTransactions);

// Lock escrow for a deal
router.post("/escrow/:dealId/lock", authentication, lockEscrow);

// Get escrow status for a deal
router.get("/escrow/:dealId", authentication, getEscrowStatus);

export default router;
