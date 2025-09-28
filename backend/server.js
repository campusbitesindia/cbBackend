const dotenv = require("dotenv");
const app = require("./app");
const {connectDB} = require("./config/database");
const {  setupewebPush } = require("./config/webPush");
const http = require('http');
const { Server } = require('socket.io');

dotenv.config({path: "./config/config.env"});

// Create HTTP server manually
const server = http.createServer(app);

// Setup socket.io
const io = new Server(server, {
  cors: {
      origin: "*", // or your frontend URL
      methods: ["GET", "POST"]
    }
});

// Store globally
global.io = io;

// Handle sockets
io.on('connection', (socket) => {
    console.log("🚀 Connected: ", socket.id);
    
    socket.on('Join_Room', (roomId) => {
        socket.join(roomId);
        console.log(`Joined room: ${roomId}`);
    });
    
    socket.on('disconnect', () => {
        console.log("❌ Disconnected: ", socket.id);
    });
});

// Start server
server.listen(process.env.PORT, ()=>{
    console.log(`Server is up on port: ${process.env.PORT}`);
})
connectDB();
setupewebPush() 
