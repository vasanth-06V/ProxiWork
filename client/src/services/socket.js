// client/src/services/socket.js
import io from 'socket.io-client';

// 1. Determine the URL
// If VITE_SOCKET_URL is set (in Vercel), use it. Otherwise, default to localhost.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

console.log('🔌 Connecting Socket to:', SOCKET_URL); // Debug log to see what's happening

// 2. Initialize Socket
export const socket = io(SOCKET_URL, {
    autoConnect: false, // Wait for manual connection
    withCredentials: true,
    transports: ['websocket', 'polling'] // Try WebSocket first, fall back to polling
});

// 3. Helper Functions
export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};