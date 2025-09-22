import express from "express";
import { authentication } from "../../../middleware/authMiddleware.js";
import {
  createReview,
  getUserReviews,
  getReviewableUsers,
  getReviewsByUser,
} from "../controllers/reviewController.js";

const router = express.Router();

// All routes require authentication
router.use(authentication);

// Create a new review
router.post("/", createReview);

// Get reviews for a specific user (received reviews)
router.get("/user/:username", getUserReviews);

// Get reviews given by a specific user
router.get("/by-user/:username", getReviewsByUser);

// Get users that can be reviewed for a specific deal
router.get("/deal/:dealId/reviewable", getReviewableUsers);

export default router;
