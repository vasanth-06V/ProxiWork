// server/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const pool = require('./src/config/db');
const socketHandler = require('./src/socket/socketHandler');
const AppError = require('./src/utils/AppError');
const errorMiddleware = require('./src/middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);

// ---- SOCKET.IO SETUP ----
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Initialize socket events
socketHandler(io);

// ---- MIDDLEWARE ----
app.use(cors());
app.use(express.json());

// ---- DB TEST ----
pool.query('SELECT NOW()', (err) => {
    if (err) console.error('❌ DB connection failed:', err);
    else console.log('✅ PostgreSQL connected');
});

// ---- ROUTES ----
app.get('/', (req, res) => res.send('ProxiWork API running'));

app.use('/api/auth', require('./src/api/routes/authRoutes'));
app.use('/api/profiles', require('./src/api/routes/profileRoutes'));
app.use('/api/jobs', require('./src/api/routes/jobRoutes'));
app.use('/api/proposals', require('./src/api/routes/proposalRoutes'));
app.use('/api/projects', require('./src/api/routes/projectRoutes'));
app.use('/api/ratings', require('./src/api/routes/ratingRoutes'));
app.use('/api/complaints', require('./src/api/routes/complaintRoutes'));
app.use('/api/upload', require('./src/api/routes/uploadRoutes'));
app.use('/api/notifications', require('./src/api/routes/notificationRoutes'));

// ---- 404 HANDLER ----
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// ---- GLOBAL ERROR HANDLER ----
app.use(errorMiddleware);

// ---- START SERVER ----
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
