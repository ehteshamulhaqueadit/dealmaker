import { useEffect, useRef } from "react";
import { useSocketContext } from "../contexts/SocketProvider";

// Custom hook for accessing socket service
export const useSocket = () => {
  const { socket } = useSocketContext();
  return socket;
};

// Hook for deal-specific real-time updates
export const useDealRealtime = (dealId, callbacks = {}) => {
  const socket = useSocket();

  useEffect(() => {
    if (!dealId) return;

    // Join deal room
    socket.joinDealRoom(dealId);

    // Set up listeners with provided callbacks
    if (callbacks.onDealUpdate) {
      socket.onDealUpdate(callbacks.onDealUpdate);
    }

    if (callbacks.onBidUpdate) {
      socket.onBidUpdate(callbacks.onBidUpdate);
    }

    if (callbacks.onDealmakerRequestUpdate) {
      socket.onDealmakerRequestUpdate(callbacks.onDealmakerRequestUpdate);
    }

    if (callbacks.onEscrowUpdate) {
      socket.onEscrowUpdate(callbacks.onEscrowUpdate);
    }

    if (callbacks.onProgressUpdate) {
      socket.onProgressUpdate(callbacks.onProgressUpdate);
    }

    if (callbacks.onMessageUpdate) {
      socket.onMessageUpdate(callbacks.onMessageUpdate);
    }

    // Cleanup
    return () => {
      socket.leaveDealRoom(dealId);
      socket.removeAllListeners();
    };
  }, [dealId, socket, callbacks]);

  return socket;
};

// Hook for general real-time updates (for deals page, etc.)
export const useGlobalRealtime = (callbacks = {}) => {
  const socket = useSocket();

  useEffect(() => {
    // Set up global listeners
    if (callbacks.onDealUpdate) {
      socket.onDealUpdate(callbacks.onDealUpdate);
    }

    if (callbacks.onBidUpdate) {
      socket.onBidUpdate(callbacks.onBidUpdate);
    }

    if (callbacks.onDealmakerRequestUpdate) {
      socket.onDealmakerRequestUpdate(callbacks.onDealmakerRequestUpdate);
    }

    if (callbacks.onNotification) {
      socket.onNotification(callbacks.onNotification);
    }

    // Cleanup
    return () => {
      socket.removeAllListeners();
    };
  }, [socket, callbacks]);

  return socket;
};
