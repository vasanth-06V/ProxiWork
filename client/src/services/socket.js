// client/src/services/socket.js
import { io } from 'socket.io-client';

const URL = 'http://localhost:5000';
export const socket = io(URL, { autoConnect: false }); // <-- 1. Don't connect automatically

// 2. We now export functions to control the connection
export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};