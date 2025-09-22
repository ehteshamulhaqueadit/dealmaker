import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getUserProfile } from "../api/userData";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status and fetch full profile
  const checkAuth = async () => {
    const token = Cookies.get("auth_token");
    if (token) {
      // Decode token to get user info (simple decode, not verification)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;

        // Check if token is expired
        if (payload.exp && payload.exp < currentTime) {
          // Token expired, remove it
          Cookies.remove("auth_token");
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(true);

          // Try to fetch full user profile
          try {
            const fullProfile = await getUserProfile();
            setUser(fullProfile);
          } catch (error) {
            // If profile fetch fails, use token data
            setUser({
              id: payload.id,
              username: payload.username,
              email: payload.email,
            });
          }
        }
      } catch (error) {
        // If token is malformed, remove it
        Cookies.remove("auth_token");
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  // Login function
  const login = (token, userData) => {
    Cookies.set("auth_token", token, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    Cookies.remove("auth_token");
    setIsAuthenticated(false);
    setUser(null);
    // Optionally redirect to home page
    window.location.href = "/";
  };

  // Update user profile in context
  const updateUserProfile = (updatedProfile) => {
    setUser(updatedProfile);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
