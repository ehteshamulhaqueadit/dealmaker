import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  // Initialize WebSocket connection
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.connected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    return this.socket;
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  // Join user room for personal notifications
  joinUserRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit("join-user-room", userId);
    }
  }

  // Join deal room for deal-specific updates
  joinDealRoom(dealId) {
    if (this.socket && dealId) {
      this.socket.emit("join-deal-room", dealId);
    }
  }

  // Leave deal room
  leaveDealRoom(dealId) {
    if (this.socket && dealId) {
      this.socket.emit("leave-deal-room", dealId);
    }
  }

  // Listen for deal updates
  onDealUpdate(callback) {
    if (this.socket) {
      this.socket.on("deal-updated", callback);
      this.listeners.set("deal-updated", callback);
    }
  }

  // Listen for dealmaker request updates
  onDealmakerRequestUpdate(callback) {
    if (this.socket) {
      this.socket.on("dealmaker-request-updated", callback);
      this.listeners.set("dealmaker-request-updated", callback);
    }
  }

  // Listen for bid updates
  onBidUpdate(callback) {
    if (this.socket) {
      this.socket.on("bid-updated", callback);
      this.listeners.set("bid-updated", callback);
    }
  }

  // Listen for escrow updates
  onEscrowUpdate(callback) {
    if (this.socket) {
      this.socket.on("escrow-updated", callback);
      this.listeners.set("escrow-updated", callback);
    }
  }

  // Listen for progress updates
  onProgressUpdate(callback) {
    if (this.socket) {
      this.socket.on("progress-updated", callback);
      this.listeners.set("progress-updated", callback);
    }
  }

  // Listen for message updates
  onMessageUpdate(callback) {
    if (this.socket) {
      this.socket.on("message-updated", callback);
      this.listeners.set("message-updated", callback);
    }
  }

  // Listen for notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on("notification", callback);
      this.listeners.set("notification", callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Remove specific listener
  removeListener(eventName) {
    if (this.socket && this.listeners.has(eventName)) {
      const callback = this.listeners.get(eventName);
      this.socket.off(eventName, callback);
      this.listeners.delete(eventName);
    }
  }

  // Check if connected
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;
