import axios from "./axiosInstance";

// Get user profile
export async function getUserProfile() {
  const response = await axios.get("/user-profile"); // Updated URL
  return response.data;
}

// Update user profile
export async function updateUserProfile(data) {
  const response = await axios.post("/user-profile", data); // Changed PUT to POST
  return response.data;
}
