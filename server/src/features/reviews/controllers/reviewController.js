import Review from "../models/reviewModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";
import { Op } from "sequelize";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { dealId, reviewedUsername, rating, comment } = req.body;
    const reviewerUsername = req.user.username;

    // Validate required fields
    if (!dealId || !reviewedUsername || !rating) {
      return res.status(400).json({
        message: "Deal ID, reviewed username, and rating are required",
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if deal exists and is completed
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    if (!deal.is_completed) {
      return res.status(400).json({
        message: "Reviews can only be given for completed deals",
      });
    }

    // Check if reviewer was part of the deal
    const isReviewerInDeal =
      deal.dealer_creator === reviewerUsername ||
      deal.dealer_joined === reviewerUsername ||
      deal.dealmaker === reviewerUsername;

    if (!isReviewerInDeal) {
      return res.status(403).json({
        message: "You can only review people from deals you participated in",
      });
    }

    // Check if reviewed user was part of the deal
    const isReviewedInDeal =
      deal.dealer_creator === reviewedUsername ||
      deal.dealer_joined === reviewedUsername ||
      deal.dealmaker === reviewedUsername;

    if (!isReviewedInDeal) {
      return res.status(400).json({
        message: "You can only review people who participated in this deal",
      });
    }

    // Prevent self-review
    if (reviewerUsername === reviewedUsername) {
      return res.status(400).json({
        message: "You cannot review yourself",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        dealId,
        reviewerUsername,
        reviewedUsername,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this user for this deal",
      });
    }

    // Create the review
    const review = await Review.create({
      dealId,
      reviewerUsername,
      reviewedUsername,
      rating,
      comment: comment || "",
      dealTitle: deal.title,
    });

    // Fetch the created review with user details
    const createdReview = await Review.findByPk(review.id, {
      include: [
        {
          model: userModel,
          as: "reviewer",
          attributes: ["username", "full_name"],
        },
      ],
    });

    res.status(201).json({
      message: "Review created successfully",
      review: createdReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      message: "Error creating review",
      error: error.message,
    });
  }
};

// Get reviews for a specific user
export const getUserReviews = async (req, res) => {
  try {
    const { username } = req.params;

    // Check if user exists
    const user = await userModel.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get all reviews for this user
    const reviews = await Review.findAll({
      where: { reviewedUsername: username },
      include: [
        {
          model: userModel,
          as: "reviewer",
          attributes: ["username", "full_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.status(200).json({
      username,
      reviews,
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({
      message: "Error fetching user reviews",
      error: error.message,
    });
  }
};

// Get reviewable users for a specific deal
export const getReviewableUsers = async (req, res) => {
  try {
    const { dealId } = req.params;
    const currentUsername = req.user.username;

    // Check if deal exists and is completed
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    if (!deal.is_completed) {
      return res.status(400).json({
        message: "Reviews can only be given for completed deals",
      });
    }

    // Check if current user was part of the deal
    const isUserInDeal =
      deal.dealer_creator === currentUsername ||
      deal.dealer_joined === currentUsername ||
      deal.dealmaker === currentUsername;

    if (!isUserInDeal) {
      return res.status(403).json({
        message: "You can only review people from deals you participated in",
      });
    }

    // Get all participants except current user
    const participants = [];
    if (deal.dealer_creator && deal.dealer_creator !== currentUsername) {
      participants.push({
        username: deal.dealer_creator,
        role: "Creator",
      });
    }
    if (deal.dealer_joined && deal.dealer_joined !== currentUsername) {
      participants.push({
        username: deal.dealer_joined,
        role: "Participant",
      });
    }
    if (deal.dealmaker && deal.dealmaker !== currentUsername) {
      participants.push({
        username: deal.dealmaker,
        role: "Dealmaker",
      });
    }

    // Get existing reviews by current user for this deal
    const existingReviews = await Review.findAll({
      where: {
        dealId,
        reviewerUsername: currentUsername,
      },
      attributes: ["reviewedUsername"],
    });

    const alreadyReviewedUsernames = existingReviews.map(
      (review) => review.reviewedUsername
    );

    // Filter out already reviewed users
    const reviewableUsers = participants.filter(
      (participant) => !alreadyReviewedUsernames.includes(participant.username)
    );

    res.status(200).json({
      dealId,
      dealTitle: deal.title,
      reviewableUsers,
      totalReviewable: reviewableUsers.length,
    });
  } catch (error) {
    console.error("Error fetching reviewable users:", error);
    res.status(500).json({
      message: "Error fetching reviewable users",
      error: error.message,
    });
  }
};

// Get reviews given by a user
export const getReviewsByUser = async (req, res) => {
  try {
    const { username } = req.params;

    const reviews = await Review.findAll({
      where: { reviewerUsername: username },
      include: [
        {
          model: userModel,
          as: "reviewed",
          attributes: ["username", "full_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      reviewerUsername: username,
      reviews,
      totalGiven: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews by user:", error);
    res.status(500).json({
      message: "Error fetching reviews by user",
      error: error.message,
    });
  }
};
