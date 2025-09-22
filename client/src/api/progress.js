import axiosInstance from "./axiosInstance";

// Create a new progress item
export const createProgress = async (dealId, title, description) => {
  try {
    const response = await axiosInstance.post("/progress", {
      dealId,
      title,
      description,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating progress:", error);
    throw error;
  }
};

// Get all progress items for a deal
export const getProgress = async (dealId) => {
  try {
    const response = await axiosInstance.get(`/progress/deal/${dealId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching progress:", error);
    throw error;
  }
};

// Update progress status
export const updateProgressStatus = async (progressId, status) => {
  try {
    const response = await axiosInstance.put(`/progress/${progressId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating progress status:", error);
    throw error;
  }
};

// Mark deal as complete
export const markDealComplete = async (dealId) => {
  try {
    const response = await axiosInstance.put(
      `/progress/deal/${dealId}/complete`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking deal complete:", error);
    throw error;
  }
};
