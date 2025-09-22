import axiosInstance from "./axiosInstance";

// Deposit money to wallet
export const depositMoney = async (amount) => {
  try {
    const response = await axiosInstance.post("/wallet/deposit", {
      amount,
    });
    return response.data;
  } catch (error) {
    console.error("Error depositing money:", error);
    throw error;
  }
};

// Get wallet information
export const getWallet = async () => {
  try {
    const response = await axiosInstance.get("/wallet");
    return response.data;
  } catch (error) {
    console.error("Error fetching wallet:", error);
    throw error;
  }
};

// Get transaction history
export const getTransactions = async () => {
  try {
    const response = await axiosInstance.get("/wallet/transactions");
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Lock escrow for a deal
export const lockEscrow = async (dealId) => {
  try {
    const response = await axiosInstance.post(`/wallet/escrow/${dealId}/lock`);
    return response.data;
  } catch (error) {
    console.error("Error locking escrow:", error);
    throw error;
  }
};

// Get escrow status for a deal
export const getEscrowStatus = async (dealId) => {
  try {
    const response = await axiosInstance.get(`/wallet/escrow/${dealId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching escrow status:", error);
    throw error;
  }
};
