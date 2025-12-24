import app from "./app.js";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";
import socketService from "./utils/socketService.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

// Create HTTPS server with your SSL certificates
const httpsServer = https.createServer({
  key: fs.readFileSync("privkey.pem"),
  cert: fs.readFileSync("fullchain.pem"),
}, app);

// Initialize Socket.IO on the HTTPS server
const io = new Server(httpsServer, {
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

// Start HTTPS server with Socket.IO attached
httpsServer.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTPS + Socket.IO server running on port ${PORT}`);
});
