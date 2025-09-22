import axiosInstance from "./axiosInstance";

// Create a new review
export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post("/reviews", reviewData);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

// Get reviews for a specific user (reviews they received)
export const getUserReviews = async (username) => {
  try {
    const response = await axiosInstance.get(`/reviews/user/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
};

// Get reviews given by a specific user
export const getReviewsByUser = async (username) => {
  try {
    const response = await axiosInstance.get(`/reviews/by-user/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews by user:", error);
    throw error;
  }
};

// Get users that can be reviewed for a specific deal
export const getReviewableUsers = async (dealId) => {
  try {
    const response = await axiosInstance.get(
      `/reviews/deal/${dealId}/reviewable`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reviewable users:", error);
    throw error;
  }
};
