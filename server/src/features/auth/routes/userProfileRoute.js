import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userProfileController.js";
import { authentication } from "../../../middleware/authMiddleware.js";

const userProfileRouter = express.Router();

userProfileRouter.use(authentication); // Apply authentication middleware to all routes in this router

userProfileRouter.get("/", getUserProfile);
userProfileRouter.post("/", updateUserProfile);

export default userProfileRouter;
