import axiosInstance from "./axiosInstance";

// Fetch all deals based on a keyword
export const fetchDeals = async (keyword) => {
  try {
    const endpoint = keyword ? `/deals/all/${keyword}` : `/deals/all`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching deals:", error);
    throw error;
  }
};

// Fetch deals created by the logged-in user
export const fetchMyDeals = async () => {
  try {
    const response = await axiosInstance.get("/deals/my-deals");
    return response.data;
  } catch (error) {
    console.error("Error fetching my deals:", error);
    throw error;
  }
};

// Create a new deal
export const createDeal = async (dealData) => {
  try {
    const response = await axiosInstance.post("/deals/create-deal", dealData);
    return response.data;
  } catch (error) {
    console.error("Error creating deal:", error);
    throw error;
  }
};

// Join a deal as a dealer
export const joinDealAsDealer = async (dealId) => {
  try {
    const response = await axiosInstance.put(
      `/deals/join-deal-as-dealer/${dealId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error joining deal as dealer:", error);
    throw error;
  }
};

// Leave a deal as a dealer
export const leaveDealAsDealer = async (dealId) => {
  try {
    const response = await axiosInstance.put(
      `/deals/leave-deal-as-dealer/${dealId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error leaving deal as dealer:", error);
    throw error;
  }
};

// Delete a deal
export const deleteDeal = async (dealId) => {
  try {
    const response = await axiosInstance.delete(`/deals/delete-deal/${dealId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting deal:", error);
    throw error;
  }
};
