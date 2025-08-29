import React, { createContext, useContext, useEffect, useState } from "react";
import socketService from "../services/socketService";
import { getUserProfile } from "../api/userData";

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

  useEffect(() => {
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

    // Cleanup on unmount
    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

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
