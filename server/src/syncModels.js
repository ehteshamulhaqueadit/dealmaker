import { db_connection, testConnection } from "../config/db_connection.js";

import { userModel, tempUserModel } from "./features/auth/models/authModel.js"; // Import all models so Sequelize registers them

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
