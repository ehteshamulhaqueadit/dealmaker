import axiosInstance from "./axiosInstance";

// Create a new dispute
export const createDispute = async (dealId, title, description) => {
  try {
    const response = await axiosInstance.post("/disputes", {
      dealId,
      title,
      description,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating dispute:", error);
    throw error;
  }
};

// Get all disputes for a deal
export const getDisputes = async (dealId) => {
  try {
    const response = await axiosInstance.get(`/disputes/deal/${dealId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching disputes:", error);
    throw error;
  }
};

// Resolve a dispute (dealmaker only)
export const resolveDispute = async (disputeId, resolution) => {
  try {
    const response = await axiosInstance.put(`/disputes/${disputeId}/resolve`, {
      resolution,
    });
    return response.data;
  } catch (error) {
    console.error("Error resolving dispute:", error);
    throw error;
  }
};
