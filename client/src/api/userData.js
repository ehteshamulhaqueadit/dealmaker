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

// Upload profile picture
export async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const response = await axios.post("/user-profile/upload-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

// Delete profile picture
export async function deleteProfilePicture() {
  const response = await axios.delete("/user-profile/profile-picture");
  return response.data;
}
