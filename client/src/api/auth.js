import axios from "./axiosInstance";

// Login user
export async function login(credentials) {
  const response = await axios.post("/auth/login", credentials);
  return response.data;
}

// Register user
export async function register(data) {
  const response = await axios.post("/auth/register", data);
  return response.data;
}

// Confirm email
export async function confirmEmail(token) {
  const response = await axios.get("/auth/register/" + token);
  return response.data;
}

// Request password reset
export async function requestPasswordReset(email) {
  const response = await axios.post("/auth/reset_password", { email });
  return response.data;
}

// Reset password with token
export async function resetPassword(username, token, newPassword) {
  const response = await axios.post(
    "/auth/reset_password/" + username + "/" + token,
    {
      newPassword,
    }
  );
  return response.data;
}
