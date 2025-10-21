// client/src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import Navbar from './components/Navbar';
// 1. Import everything from our socket service
import { socket, connectSocket, disconnectSocket } from './services/socket';

function App() {
  useEffect(() => {
    const onConnect = () => {
      console.log('✅ Socket connected on frontend with ID:', socket.id);
    };

    const onDisconnect = () => {
      console.log('🔥 Socket disconnected on frontend');
    };

    // 2. Set up the listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // 3. Explicitly tell the socket to connect
    connectSocket();

    // 4. The cleanup function now disconnects and removes listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      disconnectSocket();
    };
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        <AppRouter />
      </main>
    </BrowserRouter>
  );
}

export default App;