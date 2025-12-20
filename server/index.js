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

// --- 1. MIDDLEWARE (CORS FIX - PERMISSIVE MODE) ---
// origin: true tells the server to reflect the request origin. 
// It effectively allows any domain to connect while still supporting credentials/cookies.
app.use(cors({
    origin: true, 
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
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorMiddleware);

// --- SERVER & SOCKET SETUP ---
const server = http.createServer(app);

// --- 3. SOCKET CORS FIX ---
const io = new Server(server, {
    cors: {
        origin: allowedOrigins, // Use the same allowed list
        methods: ["GET", "POST"],
        credentials: true
    }
});

socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});