import axiosInstance from "./axiosInstance";

// Send a message to a deal
export const sendMessage = async (dealId, content) => {
  try {
    const response = await axiosInstance.post("/messages/send", {
      dealId,
      content,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get all messages for a specific deal
export const getMessagesByDeal = async (dealId) => {
  try {
    const response = await axiosInstance.get(`/messages/deal/${dealId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await axiosInstance.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
