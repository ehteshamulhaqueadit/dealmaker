import React, { createContext, useContext, useEffect, useState } from "react";
import socketService from "../services/socketService";
import { getUserProfile } from "../api/userData";
import { useAuth } from "./AuthContext"; // Add this import

const SocketContext = createContext();

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { isAuthenticated, loading } = useAuth(); // Get auth state

  useEffect(() => {
    // Only initialize socket if user is authenticated and auth loading is complete
    if (!loading && isAuthenticated) {
      const initializeSocket = async () => {
        try {
          // Get user profile first
          const userData = await getUserProfile();
          setCurrentUser(userData);

          // Initialize socket connection
          const socket = socketService.connect();

          socket.on("connect", () => {
            console.log("Socket connected successfully");
            setIsConnected(true);

            // Join user room for personal notifications
            if (userData && userData.id) {
              socketService.joinUserRoom(userData.id);
            }
          });

          socket.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
          });

          socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setIsConnected(false);
          });
        } catch (error) {
          console.error("Failed to initialize socket:", error);
        }
      };

      initializeSocket();
    } else if (!loading && !isAuthenticated) {
      // If not authenticated, cleanup any existing connections
      socketService.removeAllListeners();
      socketService.disconnect();
      setIsConnected(false);
      setCurrentUser(null);
    }

    // Cleanup on unmount or auth change
    return () => {
      if (!isAuthenticated) {
        socketService.removeAllListeners();
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, loading]); // Depend on auth state

  const value = {
    socket: socketService,
    isConnected,
    currentUser,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
