const dotenv = require("dotenv");
const app = require("./app");
const { connectDB } = require("./config/database");
const { setupewebPush } = require("./config/webPush");
const http = require('http');
const { Server } = require('socket.io');

dotenv.config({ path: "./config/config.env" });

// Create HTTP server
const server = http.createServer(app);

// Setup socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://campus-bites-c7pe.vercel.app",
      "https://campus-bites-eta.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store globally
global.io = io;

// Handle sockets
io.on('connection', (socket) => {
  console.log(`🚀 Connected: ${socket.id}`);

  // Join group order room based on groupLink
  socket.on('joinGroupOrder', (groupLink) => {
    socket.join(`groupOrder:${groupLink}`);
    console.log(`Socket ${socket.id} joined room: groupOrder:${groupLink}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// Function to broadcast group order updates
global.broadcastGroupOrderUpdate = (groupLink, groupOrder) => {
  io.to(`groupOrder:${groupLink}`).emit('ORDER_UPDATED', {
    type: 'ORDER_UPDATED',
    groupOrder
  });
};

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is up on port: ${process.env.PORT}`);
});

connectDB();
setupewebPush();