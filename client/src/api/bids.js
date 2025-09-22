import axiosInstance from "./axiosInstance";

// Fetch all bids
export const fetchAllBids = async () => {
  try {
    const response = await axiosInstance.get("/bids/all");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all bids", error);
    throw error;
  }
};

// Fetch a single bid by ID
export const fetchBidById = async (id) => {
  try {
    const response = await axiosInstance.get(`/bids/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch bid with ID: ${id}`, error);
    throw error;
  }
};

// Create a new bid
export const createBid = async (bidData) => {
  try {
    const response = await axiosInstance.post("/bidding/create", bidData);
    return response.data;
  } catch (error) {
    console.error("Failed to create bid", error);
    throw error;
  }
};

// Update an existing bid by ID
export const updateBid = async (id, bidData) => {
  try {
    const response = await axiosInstance.put(`/bidding/${id}`, bidData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update bid with ID: ${id}`, error);
    throw error;
  }
};

// Delete a bid by ID
export const deleteBid = async (id) => {
  try {
    const response = await axiosInstance.delete(`/bidding/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete bid with ID: ${id}`, error);
    throw error;
  }
};

// Fetch bids by deal ID
export const getBidByDealId = async (dealId) => {
  try {
    const response = await axiosInstance.get(`/bidding/deal/${dealId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch bids for deal ID: ${dealId}`, error);
    throw error;
  }
};
