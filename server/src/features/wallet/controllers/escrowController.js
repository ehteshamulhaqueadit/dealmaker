import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import Escrow from "../models/escrowModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";
import { db_connection } from "../../../../config/db_connection.js";

export const lockEscrow = async (req, res) => {
  const transaction = await db_connection.transaction();

  try {
    const { dealId } = req.params;
    let userId = req.user.id;
    const username = req.user.username;

    // Fallback for tokens without user ID
    if (!userId) {
      const user = await userModel.findOne({
        where: { username },
      });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ message: "User not found" });
      }
      userId = user.id;
    }

    // Find the deal
    const deal = await dealModel.findByPk(dealId, { transaction });
    if (!deal) {
      await transaction.rollback();
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check if user is authorized (creator or counterpart)
    const isCreator = deal.dealer_creator === username;
    const isCounterpart = deal.dealer_joined === username;

    if (!isCreator && !isCounterpart) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Only deal participants can pay escrow",
      });
    }

    // Check if deal has dealmaker
    if (!deal.dealmaker) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "Deal must have an assigned dealmaker before escrow can be locked",
      });
    }

    // Find or create escrow
    let escrow = await Escrow.findOne({
      where: { dealId },
      transaction,
    });

    if (!escrow) {
      const halfBudget = parseFloat(deal.budget) / 2;
      escrow = await Escrow.create(
        {
          dealId,
          totalAmount: parseFloat(deal.budget),
          creatorContribution: halfBudget,
          counterpartContribution: halfBudget,
          dealmaker: deal.dealmaker,
          status: "pending",
        },
        { transaction }
      );
    }

    // Check if user already paid
    if (
      (isCreator && escrow.creatorPaid) ||
      (isCounterpart && escrow.counterpartPaid)
    ) {
      await transaction.rollback();
      return res.status(400).json({
        message: "You have already paid your escrow contribution",
      });
    }

    // Get user's wallet
    const wallet = await Wallet.findOne({
      where: { userId },
      transaction,
    });

    if (!wallet) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Wallet not found. Please deposit money first.",
      });
    }

    // Calculate required amount
    const requiredAmount = isCreator
      ? escrow.creatorContribution
      : escrow.counterpartContribution;

    // Check if user has sufficient balance
    if (parseFloat(wallet.balance) < requiredAmount) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Insufficient balance. Required: $${requiredAmount}, Available: $${wallet.balance}`,
      });
    }

    // Deduct from wallet
    const newBalance = parseFloat(wallet.balance) - requiredAmount;
    await wallet.update(
      {
        balance: newBalance,
      },
      { transaction }
    );

    // Create transaction record
    await Transaction.create(
      {
        userId,
        username,
        type: "escrow_lock",
        amount: requiredAmount,
        dealId,
        status: "completed",
        description: `Escrow payment for deal: ${deal.title}`,
        balanceAfter: newBalance,
      },
      { transaction }
    );

    // Update escrow
    const escrowUpdate = {};
    if (isCreator) {
      escrowUpdate.creatorPaid = true;
    } else {
      escrowUpdate.counterpartPaid = true;
    }

    // Check if both parties paid
    const bothPaid =
      (escrowUpdate.creatorPaid || escrow.creatorPaid) &&
      (escrowUpdate.counterpartPaid || escrow.counterpartPaid);

    if (bothPaid) {
      escrowUpdate.status = "locked";
      // Update deal to reflect escrow is locked
      await deal.update(
        {
          is_protected: true,
          escrow_locked: true,
          escrow_amount: escrow.totalAmount,
        },
        { transaction }
      );
    }

    await escrow.update(escrowUpdate, { transaction });

    await transaction.commit();

    res.status(200).json({
      message: bothPaid
        ? "Escrow fully locked! Deal is now protected and cannot be deleted."
        : "Your escrow payment has been processed. Waiting for other party.",
      escrow: await Escrow.findByPk(escrow.id),
      wallet: { balance: newBalance },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error locking escrow:", error);
    res.status(500).json({
      message: "Error processing escrow payment",
      error: error.message,
    });
  }
};

export const releaseEscrow = async (dealId) => {
  const transaction = await db_connection.transaction();

  try {
    // Find the deal and escrow
    const deal = await dealModel.findByPk(dealId, { transaction });
    const escrow = await Escrow.findOne({
      where: { dealId },
      transaction,
    });

    if (!deal || !escrow) {
      await transaction.rollback();
      return { success: false, message: "Deal or escrow not found" };
    }

    if (escrow.status !== "locked") {
      await transaction.rollback();
      return { success: false, message: "Escrow is not locked" };
    }

    // Find dealmaker
    const dealmaker = await userModel.findOne({
      where: { username: escrow.dealmaker },
      transaction,
    });

    if (!dealmaker) {
      await transaction.rollback();
      return { success: false, message: "Dealmaker not found" };
    }

    // Find or create dealmaker's wallet
    let dealmakerWallet = await Wallet.findOne({
      where: { userId: dealmaker.id },
      transaction,
    });

    if (!dealmakerWallet) {
      dealmakerWallet = await Wallet.create(
        {
          userId: dealmaker.id,
          username: dealmaker.username,
          balance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
        },
        { transaction }
      );
    }

    // Transfer escrow to dealmaker
    const newBalance =
      parseFloat(dealmakerWallet.balance) + parseFloat(escrow.totalAmount);
    await dealmakerWallet.update(
      {
        balance: newBalance,
      },
      { transaction }
    );

    // Create transaction record for dealmaker
    await Transaction.create(
      {
        userId: dealmaker.id,
        username: dealmaker.username,
        type: "payment_received",
        amount: escrow.totalAmount,
        dealId,
        status: "completed",
        description: `Payment received for completing deal: ${deal.title}`,
        balanceAfter: newBalance,
      },
      { transaction }
    );

    // Update escrow status
    await escrow.update(
      {
        status: "released",
        releasedAt: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    return {
      success: true,
      message: "Escrow released to dealmaker successfully",
      amount: escrow.totalAmount,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error releasing escrow:", error);
    return { success: false, message: "Error releasing escrow" };
  }
};

export const getEscrowStatus = async (req, res) => {
  try {
    const { dealId } = req.params;
    const username = req.user.username;

    // Find the deal
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check if user is authorized
    const isAuthorized =
      deal.dealer_creator === username ||
      deal.dealer_joined === username ||
      deal.dealmaker === username;

    if (!isAuthorized) {
      return res.status(403).json({
        message: "You are not authorized to view escrow status for this deal",
      });
    }

    // Find escrow
    const escrow = await Escrow.findOne({
      where: { dealId },
    });

    if (!escrow) {
      return res.status(200).json({
        escrowExists: false,
        message: "No escrow created for this deal yet",
      });
    }

    res.status(200).json({
      escrowExists: true,
      escrow,
      deal: {
        is_protected: deal.is_protected,
        escrow_locked: deal.escrow_locked,
        escrow_amount: deal.escrow_amount,
      },
    });
  } catch (error) {
    console.error("Error fetching escrow status:", error);
    res.status(500).json({
      message: "Error fetching escrow status",
      error: error.message,
    });
  }
};
