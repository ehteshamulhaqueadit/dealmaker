import express from "express";
import authRouter from "./features/auth/routes/authRoute.js";
import userProfileRouter from "./features/auth/routes/userProfileRoute.js";
import syncModels from "./syncModels.js";

import profilesRouter from "./features/twoProfiles/routes/profilesRoutes.js";
import dealRouter from "./features/deals/routes/dealsRoute.js";
import biddingRouter from "./features/bidding/routes/biddingRoute.js";
import bidManagementRouter from "./features/bid_management/routes/bidManagementRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();

// Setup CORS middleware

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin); // Echo back the requesting origin
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/user-profile", userProfileRouter);

app.use("/api/profiles", profilesRouter);

app.use("/api/deals", dealRouter);
app.use("/api/bidding", biddingRouter);
app.use("/api/bid-management", bidManagementRouter);

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
