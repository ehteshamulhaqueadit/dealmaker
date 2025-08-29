// WebSocket service for real-time updates
class SocketService {
  constructor() {
    this.io = null;
  }

  initialize(io) {
    this.io = io;
  }

  // Broadcast deal updates to all users
  broadcastDealUpdate(dealId, dealData, updateType) {
    if (this.io) {
      // Broadcast to all clients and specific deal room
      this.io.emit("deal-updated", {
        dealId,
        dealData,
        updateType, // 'created', 'updated', 'deleted', 'joined', 'left'
        timestamp: new Date(),
      });

      // Also broadcast to specific deal room
      this.io.to(`deal-${dealId}`).emit("deal-updated", {
        dealId,
        dealData,
        updateType,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast dealmaker request updates
  broadcastDealmakerRequestUpdate(dealId, requestData, updateType) {
    if (this.io) {
      this.io.emit("dealmaker-request-updated", {
        dealId,
        requestData,
        updateType, // 'created', 'accepted', 'rejected'
        timestamp: new Date(),
      });

      this.io.to(`deal-${dealId}`).emit("dealmaker-request-updated", {
        dealId,
        requestData,
        updateType,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast bid updates
  broadcastBidUpdate(dealId, bidData, updateType) {
    if (this.io) {
      this.io.emit("bid-updated", {
        dealId,
        bidData,
        updateType, // 'created', 'updated', 'deleted', 'selected'
        timestamp: new Date(),
      });

      this.io.to(`deal-${dealId}`).emit("bid-updated", {
        dealId,
        bidData,
        updateType,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast escrow status updates
  broadcastEscrowUpdate(dealId, escrowData, updateType) {
    if (this.io) {
      this.io.emit("escrow-updated", {
        dealId,
        escrowData,
        updateType, // 'locked', 'released', 'status-changed'
        timestamp: new Date(),
      });

      this.io.to(`deal-${dealId}`).emit("escrow-updated", {
        dealId,
        escrowData,
        updateType,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast progress updates
  broadcastProgressUpdate(dealId, progressData, updateType) {
    if (this.io) {
      this.io.emit("progress-updated", {
        dealId,
        progressData,
        updateType, // 'milestone-added', 'milestone-completed', 'deal-completed'
        timestamp: new Date(),
      });

      this.io.to(`deal-${dealId}`).emit("progress-updated", {
        dealId,
        progressData,
        updateType,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast message updates - primarily to deal room
  broadcastMessageUpdate(dealId, messageData, updateType) {
    if (this.io) {
      // Broadcast to specific deal room (most important for messages)
      this.io.to(`deal-${dealId}`).emit("message-updated", {
        dealId,
        messageData,
        updateType, // 'sent', 'read', 'deleted'
        timestamp: new Date(),
      });

      // Also broadcast globally for users not currently in deal view
      this.io.emit("message-updated", {
        dealId,
        messageData,
        updateType,
        timestamp: new Date(),
      });
    }
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit("notification", {
        ...notification,
        timestamp: new Date(),
      });
    }
  }

  // Join user to their personal room for targeted notifications
  joinUserRoom(socket, userId) {
    socket.join(`user-${userId}`);
  }

  // Join user to deal room for deal-specific updates
  joinDealRoom(socket, dealId) {
    socket.join(`deal-${dealId}`);
  }
}

export default new SocketService();
