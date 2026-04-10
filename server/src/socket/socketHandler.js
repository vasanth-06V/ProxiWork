// server/src/socket/socketHandler.js
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

module.exports = (io) => {

    // --- SOCKET AUTH MIDDLEWARE ---
    // Runs once on every new connection before any events
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.user.id; // Attach verified user ID to socket
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Authenticated user connected: ${socket.userId}`);

        // Join personal room (for push notifications)
        socket.join(`user_${socket.userId}`);

        // Join project chat room
        socket.on('join_project_room', (projectId) => {
            if (!projectId) return;
            socket.join(projectId);
            console.log(`User ${socket.userId} joined room ${projectId}`);
        });

        // Send message — senderId comes from verified socket.userId, NOT from client
        socket.on('send_message', async ({
            projectId,
            content,
            attachmentUrl = null,
            attachmentType = null
        }) => {
            try {
                if (!projectId || !content) return;

                const senderId = socket.userId; // SECURE: use server-verified ID

                // Verify user is a participant of this project before saving
                const check = await pool.query(
                    `SELECT j.client_id, p.provider_id 
                     FROM jobs j
                     JOIN proposals p ON j.job_id = p.job_id AND p.status = 'accepted'
                     WHERE j.job_id = $1`,
                    [projectId]
                );

                if (check.rows.length === 0) {
                    return socket.emit('message_error', 'Project not found.');
                }

                const { client_id, provider_id } = check.rows[0];
                if (senderId !== client_id && senderId !== provider_id) {
                    return socket.emit('message_error', 'Forbidden: You are not part of this project.');
                }

                // Save to DB
                const result = await pool.query(
                    `INSERT INTO messages (project_id, sender_id, content, attachment_url, attachment_type)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING created_at`,
                    [projectId, senderId, content, attachmentUrl, attachmentType]
                );

                // Broadcast to room
                io.to(projectId).emit('receive_message', {
                    projectId,
                    senderId,
                    content,
                    attachmentUrl,
                    attachmentType,
                    created_at: result.rows[0].created_at,
                });

            } catch (err) {
                console.error('❌ Message save failed:', err);
                socket.emit('message_error', 'Failed to send message');
            }
        });

        // Typing indicators
        socket.on('typing', ({ projectId }) => {
            socket.to(projectId).emit('user_typing', { userId: socket.userId });
        });

        socket.on('stop_typing', ({ projectId }) => {
            socket.to(projectId).emit('user_stop_typing');
        });

        // Leave room
        socket.on('leave_project_room', (projectId) => {
            socket.leave(projectId);
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`🔥 User disconnected: ${socket.userId}`);
        });
    });
};
