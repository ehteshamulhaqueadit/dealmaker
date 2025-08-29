import dealModel from "../../deals/models/dealsModel.js";
import Escrow from "../../wallet/models/escrowModel.js";
import Wallet from "../../wallet/models/walletModel.js";
import Transaction from "../../wallet/models/transactionModel.js";
import { userModel } from "../../auth/models/authModel.js";
import { db_connection } from "../../../../config/db_connection.js";

export const markDealComplete = async (req, res) => {
  const transaction = await db_connection.transaction();

  try {
    const dealId = req.params.dealId;
    const requestingUsername = req.user.username;

    // Find the deal
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      await transaction.rollback();
      return res.status(404).json({ message: "Deal not found" });
    }

    // Check if user is participant
    const isCreator = deal.dealer_creator === requestingUsername;
    const isCounterpart = deal.dealer_joined === requestingUsername;

    if (!isCreator && !isCounterpart) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Only deal participants can mark the deal as complete",
      });
    }

    // Check if deal has a dealmaker
    if (!deal.dealmaker) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Deal must have an assigned dealmaker to be completed",
      });
    }

    // Update completion status
    let updatedFields = {};
    if (isCreator && !deal.completed_by_creator) {
      updatedFields.completed_by_creator = true;
    } else if (isCounterpart && !deal.completed_by_counterpart) {
      updatedFields.completed_by_counterpart = true;
    } else {
      await transaction.rollback();
      return res.status(400).json({
        message: "You have already marked this deal as complete",
      });
    }

    // Check if both parties have marked as complete
    const bothCompleted =
      (isCreator ? true : deal.completed_by_creator) &&
      (isCounterpart ? true : deal.completed_by_counterpart);

    if (bothCompleted) {
      updatedFields.is_completed = true;
      updatedFields.completion_date = new Date();
    }

    // Update the deal
    await dealModel.update(updatedFields, {
      where: { id: dealId },
      transaction,
    });

    // If deal is now completed, release escrow payment
    if (bothCompleted) {
      const escrow = await Escrow.findOne({
        where: { dealId },
        transaction,
      });

      if (escrow && escrow.status === "locked") {
        // Find dealmaker's wallet
        const dealmakerWallet = await Wallet.findOne({
          where: { username: deal.dealmaker },
          transaction,
        });

        if (!dealmakerWallet) {
          await transaction.rollback();
          return res.status(404).json({
            message: "Dealmaker wallet not found",
          });
        }

        // Transfer escrow to dealmaker
        await Wallet.update(
          {
            balance: db_connection.literal(`balance + ${escrow.totalAmount}`),
          },
          {
            where: { username: deal.dealmaker },
            transaction,
          }
        );

        // Create transaction record
        await Transaction.create(
          {
            username: deal.dealmaker,
            type: "escrow_release",
            amount: escrow.totalAmount,
            description: `Escrow payment released for deal: ${deal.title}`,
            dealId: dealId,
          },
          { transaction }
        );

        // Update escrow status
        await Escrow.update(
          {
            status: "released",
            releasedAt: new Date(),
          },
          {
            where: { dealId },
            transaction,
          }
        );
      }
    }

    await transaction.commit();

    // Fetch updated deal
    const updatedDeal = await dealModel.findByPk(dealId);

    res.status(200).json({
      message: bothCompleted
        ? "Deal completed successfully! Escrow payment has been released to the dealmaker."
        : "Deal marked as complete by you. Waiting for the other party.",
      deal: updatedDeal,
      isCompleted: bothCompleted,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error marking deal complete:", error);
    res.status(500).json({
      message: "Error marking deal complete",
      error: error.message,
    });
  }
};
