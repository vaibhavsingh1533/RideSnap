const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { rideSocket } = require('./sockets/rideSocket');

// Import routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const allowedOrigin = process.env.FRONTEND_URL || '*';

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors({
  origin: allowedOrigin
}));
app.use(express.json());

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Run socket server config
rideSocket(io);

const PORT = process.env.PORT || 5000;

// Database Sync and Server Startup
const startServer = async () => {
  try {
    // Authenticate database connection
    await testConnection();

    // Sync database models
    // Note: In production, run proper migrations instead of sync({ alter: true }).
    // Using alter: true in local development automatically adjusts database schemas without data loss.
    await sequelize.sync();
    console.log('Database synced successfully.');

    // Start listening
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`RideSnap server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();
