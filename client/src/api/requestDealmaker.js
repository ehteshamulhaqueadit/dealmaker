import axiosInstance from "./axiosInstance";

export const searchUsers = async (keyword, dealId) => {
  const response = await axiosInstance.get(`/auth/public-info`, {
    params: { keyword, dealId },
  });
  return response.data;
};

export const sendDealmakerRequest = async (
  dealId,
  receiverUsername,
  message
) => {
  const response = await axiosInstance.post("/request-dealmaker/send-request", {
    dealId,
    receiverUsername,
    message,
  });
  return response.data;
};

export const getSentRequests = async (dealId) => {
  const response = await axiosInstance.get(`/request-dealmaker/${dealId}`);
  return response.data;
};

export const getMyDealmakerRequests = async () => {
  const response = await axiosInstance.get("/request-dealmaker/my-requests");
  return response.data;
};

export const acceptDealmakerRequest = async (requestId) => {
  const response = await axiosInstance.post(
    `/request-dealmaker/accept/${requestId}`
  );
  return response.data;
};

export const cancelDealmakerRequest = async (requestId) => {
  const response = await axiosInstance.delete(
    `/request-dealmaker/cancel/${requestId}`
  );
  return response.data;
};
