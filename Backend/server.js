const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const setupSocket = require("./sockets/rideSocket");

dotenv.config();

const app = express();
const server = http.createServer(app);

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// Socket setup
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket logic
app.set("io", io);
setupSocket(io);

// Database
connectDB();

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("RideSnap Backend Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});