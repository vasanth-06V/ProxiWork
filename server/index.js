const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Imports
const pool = require('./src/config/db'); 
const AppError = require('./src/utils/AppError');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const socketHandler = require('./src/socket/socketHandler'); 

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => res.send('ProxiWork API is running...'));
app.use('/api/auth', require('./src/api/routes/authRoutes'));
app.use('/api/profiles', require('./src/api/routes/profileRoutes'));
app.use('/api/jobs', require('./src/api/routes/jobRoutes'));
app.use('/api/proposals', require('./src/api/routes/proposalRoutes'));
app.use('/api/ratings', require('./src/api/routes/ratingRoutes'));
app.use('/api/complaints', require('./src/api/routes/complaintRoutes'));
app.use('/api/projects', require('./src/api/routes/projectRoutes'));
app.use('/api/upload', require('./src/api/routes/uploadRoutes'));
app.use('/api/notifications', require('./src/api/routes/notificationRoutes'));

// --- ERROR HANDLING ---
// 1. Handle Unhandled Routes (404)
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 2. Global Error Handler Middleware
app.use(errorMiddleware);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io accessible to all controllers via app locals
app.set('io', io);

socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    // --- DB Connection Check ---
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`✅ Database connected at: ${result.rows[0].now}`);
    } catch (err) {
        console.error('❌ Database connection FAILED:', err.message);
    }
});

// --- Handle Uncaught Errors (prevent silent crashes) ---
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err.message);
});
