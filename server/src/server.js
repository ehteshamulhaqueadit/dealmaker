import app from "./app.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import socketService from "./utils/socketService.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin); // Reflect the origin dynamically
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});


// Initialize socket service
socketService.initialize(io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user room for personal notifications
  socket.on("join-user-room", (userId) => {
    socketService.joinUserRoom(socket, userId);
    console.log(`User ${socket.id} joined user room: user-${userId}`);
  });

  // Join deal room for deal-specific updates
  socket.on("join-deal-room", (dealId) => {
    socketService.joinDealRoom(socket, dealId);
    console.log(`User ${socket.id} joined deal room: deal-${dealId}`);
  });

  // Leave deal room
  socket.on("leave-deal-room", (dealId) => {
    socket.leave(`deal-${dealId}`);
    console.log(`User ${socket.id} left deal room: deal-${dealId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io available globally for other modules
app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
