const { Server } = require("socket.io");
const http = require("http");
const app = require("./server"); // Import express app
require("dotenv").config();

const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your React frontend URL
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

module.exports = { io, server }; // Export io and server
