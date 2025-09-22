import axiosInstance from "./axiosInstance";

export const selectBid = async (dealId, bidId) => {
  try {
    const response = await axiosInstance.put(
      `/bid-management/select-bid/${dealId}/${bidId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to select bid", error);
    throw error;
  }
};
