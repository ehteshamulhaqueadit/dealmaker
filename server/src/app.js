import express from "express";
import authRouter from "./features/auth/routes/authRoute.js";
import syncModels from "./syncModels.js";
// import cors from "cors";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();

// Setup CORS middleware

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

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
