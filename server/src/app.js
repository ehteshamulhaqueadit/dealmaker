import express from "express";
import authRouter from "./features/auth/routes/authRoute.js";
import userProfileRouter from "./features/auth/routes/userProfileRoute.js";
import syncModels from "./syncModels.js";

import dealRouter from "./features/deals/routes/dealsRoute.js";
import biddingRouter from "./features/bidding/routes/biddingRoute.js";
import bidManagementRouter from "./features/bid_management/routes/bidManagementRoutes.js";
import requestDealmakerRouter from "./features/request-dealmaker/routes/requestDealmakerRoute.js";
import messageRouter from "./features/messaging/routes/messageRoutes.js";
import disputeRouter from "./features/disputes/routes/disputeRoutes.js";
import progressRouter from "./features/progress/routes/progressRoutes.js";
import walletRouter from "./features/wallet/routes/walletRoutes.js";
import reviewRouter from "./features/reviews/routes/reviewRoutes.js";
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

app.use("/api/deals", dealRouter);
app.use("/api/bidding", biddingRouter);
app.use("/api/bid-management", bidManagementRouter);
app.use("/api/request-dealmaker", requestDealmakerRouter);
app.use("/api/messages", messageRouter);
app.use("/api/disputes", disputeRouter);
app.use("/api/progress", progressRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/reviews", reviewRouter);

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
