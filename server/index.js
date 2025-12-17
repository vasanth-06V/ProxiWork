// server/index.js
require('dotenv').config();
const express = require('express');
const { createServer } = require('http'); // 1. Import Node's built-in http server
const { Server } = require('socket.io');   // 2. Import the Socket.IO Server class
const pool = require('./src/config/db');
const cors = require('cors');

const app = express();
const httpServer = createServer(app); // 3. Create an HTTP server from our Express app

const AppError = require('./src/utils/AppError'); // Import AppError
const errorMiddleware = require('./src/middleware/errorMiddleware'); // Import Handler


// 4. Create a Socket.IO server that sits on top of our HTTP server
const io = new Server(httpServer, { 
    cors: {
        origin: "http://localhost:5173", // Explicitly allow connections from our frontend
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE (No changes here) ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION TEST (No changes here) ---
pool.query('SELECT NOW()', (err, res) => {
    if (err) { console.error('Error connecting to the database:', err); } 
    else { console.log('✅ Successfully connected to the PostgreSQL database!'); }
});

// --- API ROUTES (No changes here) ---
app.use('/api/auth', require('./src/api/routes/authRoutes'));
app.use('/api/profiles', require('./src/api/routes/profileRoutes.js'));
app.use('/api/jobs', require('./src/api/routes/jobRoutes.js'));
app.use('/api/proposals', require('./src/api/routes/proposalRoutes.js'));
app.use('/api/complaints', require('./src/api/routes/complaintRoutes.js'));
app.use('/api/projects', require('./src/api/routes/projectRoutes.js'));
app.use('/api/ratings', require('./src/api/routes/ratingRoutes.js'));
app.use('/api/upload', require('./src/api/routes/uploadRoutes.js'));
app.use('/api/notifications', require('./src/api/routes/notificationRoutes.js'));

// 1. Handle Unhandled Routes (404) — FIXED
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 2. Global Error Handler Middleware
app.use(errorMiddleware);

// --- REAL-TIME CHAT LOGIC ---
io.on('connection', (socket) => {
    console.log(`🔌 A user connected with socket ID: ${socket.id}`);

    // This is the logic for a user joining a specific chat room
    socket.on('join_project_room', (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined room for project ${projectId}`);
    });

    // This listens for a new message from a user
    socket.on('send_message', async (data) => {
        try {
            const { projectId, senderId, content, attachmentUrl, attachmentType } = data;
            
            // Save to DB
            await pool.query(
                'INSERT INTO messages (project_id, sender_id, content, attachment_url, attachment_type) VALUES ($1, $2, $3, $4, $5)',
                [projectId, senderId, content, attachmentUrl || null, attachmentType || null]
            );

            io.to(data.projectId).emit('receive_message', data);
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔥 User with socket ID: ${socket.id} disconnected`);
    });
});

// 5. Tell our httpServer to listen, not the old Express app
httpServer.listen(PORT, () => console.log(`🚀 Server (API & Chat) is running on http://localhost:${PORT}`));