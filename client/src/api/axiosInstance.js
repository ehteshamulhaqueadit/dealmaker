import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL||"http://localhost:8000/api",
  withCredentials: true, // if you use cookies/sessions
});

// Updated interceptor to include token from cookie
instance.interceptors.request.use((config) => {
  const token = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("auth_token="))
    ?.split("=")[1]; // Extract token from auth_token cookie

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;
