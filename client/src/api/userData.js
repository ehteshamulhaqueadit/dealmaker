import axios from "./axiosInstance";

// Get user profile
export async function getUserProfile() {
  const response = await axios.get("/userData/profile");
  return response.data;
}

// Update user profile
export async function updateUserProfile(data) {
  const response = await axios.put("/userData/profile", data);
  return response.data;
}

// Get all user data (example)
export async function getAllUserData() {
  const response = await axios.get("/userData/all");
  return response.data;
}

// Delete user account (example)
export async function deleteUserAccount() {
  const response = await axios.delete("/userData/delete");
  return response.data;
}
