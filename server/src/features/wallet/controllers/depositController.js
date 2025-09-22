import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import { userModel } from "../../auth/models/authModel.js";
import { db_connection } from "../../../../config/db_connection.js";

export const depositMoney = async (req, res) => {
  const transaction = await db_connection.transaction();

  try {
    const { amount } = req.body;
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

    if (!amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Valid amount is required",
      });
    }

    const depositAmount = parseFloat(amount);

    // Find or create wallet
    let wallet = await Wallet.findOne({
      where: { userId },
      transaction,
    });

    if (!wallet) {
      wallet = await Wallet.create(
        {
          userId,
          username,
          balance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
        },
        { transaction }
      );
    }

    // Update wallet balance
    const newBalance = parseFloat(wallet.balance) + depositAmount;
    const newTotalDeposited = parseFloat(wallet.totalDeposited) + depositAmount;

    await wallet.update(
      {
        balance: newBalance,
        totalDeposited: newTotalDeposited,
      },
      { transaction }
    );

    // Create transaction record
    await Transaction.create(
      {
        userId,
        username,
        type: "deposit",
        amount: depositAmount,
        status: "completed",
        description: `Deposit of $${depositAmount}`,
        balanceAfter: newBalance,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      message: "Deposit successful",
      wallet: {
        balance: newBalance,
        totalDeposited: newTotalDeposited,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error depositing money:", error);
    res.status(500).json({
      message: "Error processing deposit",
      error: error.message,
    });
  }
};
