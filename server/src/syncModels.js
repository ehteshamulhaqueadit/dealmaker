import { db_connection, testConnection } from "../config/db_connection.js";

import { userModel, tempUserModel } from "./features/auth/models/authModel.js"; // Import all models so Sequelize registers them
import Message from "./features/messaging/models/messageModel.js";
import Dispute from "./features/disputes/models/disputeModel.js";
import Progress from "./features/progress/models/progressModel.js";
import Wallet from "./features/wallet/models/walletModel.js";
import Transaction from "./features/wallet/models/transactionModel.js";
import Escrow from "./features/wallet/models/escrowModel.js";

async function syncModels() {
  try {
    await testConnection();
    await db_connection.sync({ alter: true }); // alter is safe for dev
    console.log("Models synced successfully.");
  } catch (err) {
    console.error("Model sync failed:", err);
    throw err;
  }
}

export default syncModels;
