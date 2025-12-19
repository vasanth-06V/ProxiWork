const pool = require('../config/db');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Join project room
        socket.on('join_project_room', (projectId) => {
            if (!projectId) return;
            socket.join(projectId);
            console.log(`User ${socket.id} joined room ${projectId}`);
        });

        // Send message
        socket.on('send_message', async ({
            projectId,
            senderId,
            content,
            attachmentUrl = null,
            attachmentType = null
        }) => {
            try {
                if (!projectId || !senderId || !content) return;

                // Insert message and get timestamp
                const result = await pool.query(
                    `
                    INSERT INTO messages
                    (project_id, sender_id, content, attachment_url, attachment_type)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING created_at
                    `,
                    [projectId, senderId, content, attachmentUrl, attachmentType]
                );

                // Emit message with timestamp
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

        // Leave room
        socket.on('leave_project_room', (projectId) => {
            socket.leave(projectId);
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`🔥 User disconnected: ${socket.id}`);
        });
    });
};
