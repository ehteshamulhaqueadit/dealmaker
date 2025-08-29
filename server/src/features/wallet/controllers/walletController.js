import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import { userModel } from "../../auth/models/authModel.js";

export const getWallet = async (req, res) => {
  try {
    let userId = req.user.id;
    const username = req.user.username;

    // Fallback for tokens without user ID
    if (!userId) {
      const user = await userModel.findOne({
        where: { username },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      userId = user.id;
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({
      where: { userId },
      include: [
        {
          model: userModel,
          as: "user",
          attributes: ["id", "username", "full_name"],
        },
      ],
    });

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        username,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      });

      // Fetch the created wallet with user info
      wallet = await Wallet.findOne({
        where: { userId },
        include: [
          {
            model: userModel,
            as: "user",
            attributes: ["id", "username", "full_name"],
          },
        ],
      });
    }

    res.status(200).json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({
      message: "Error fetching wallet",
      error: error.message,
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    let userId = req.user.id;
    const username = req.user.username;

    // Fallback for tokens without user ID
    if (!userId) {
      const user = await userModel.findOne({
        where: { username },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      userId = user.id;
    }

    const transactions = await Transaction.findAll({
      where: { userId },
      include: [
        {
          model: userModel,
          as: "user",
          attributes: ["id", "username", "full_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 50, // Limit to last 50 transactions
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};
