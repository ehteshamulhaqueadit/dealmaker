import axiosInstance from "./axiosInstance";

// Get all users except current user
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/auth/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Search users by username or name
export const searchUsers = async (query) => {
  try {
    const response = await axiosInstance.get(
      `/auth/users/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Get user details by username
export const getUserDetails = async (username) => {
  try {
    const response = await axiosInstance.get(`/auth/users/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};
