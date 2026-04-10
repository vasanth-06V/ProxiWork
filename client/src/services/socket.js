// client/src/services/socket.js
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Pass JWT token in handshake so server can authenticate the connection
export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: {
        token: localStorage.getItem('token') // Server verifies this
    }
});

export const connectSocket = () => {
    if (!socket.connected) {
        // Refresh token in auth before reconnecting (in case user just logged in)
        socket.auth.token = localStorage.getItem('token');
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
