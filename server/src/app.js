import express from "express";
import authRouter from "./features/auth/routes/authRoute.js";
import syncModels from "./syncModels.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

// Sync models before starting server
(async () => {
  try {
    await syncModels();
    console.log("Database models synced successfully.");
  } catch (err) {
    console.error("Failed to sync database models:", err);
    process.exit(1); // Exit if sync fails
  }
})();

export default app;
