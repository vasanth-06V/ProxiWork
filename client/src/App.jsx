import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import Navbar from './components/Navbar';
import { socket, connectSocket, disconnectSocket } from './services/socket';

// --- CONTEXT PROVIDERS ---
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  useEffect(() => {
    const onConnect = () => {
      console.log('✅ Socket connected on frontend with ID:', socket.id);
    };

    const onDisconnect = () => {
      console.log('🔥 Socket disconnected on frontend');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    connectSocket();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      disconnectSocket();
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          {/* --- GLOBAL ANIMATED BACKGROUND --- */}
          <div className="ambient-background">
            <div className="orb orb1"></div>
            <div className="orb orb2"></div>
            <div className="orb orb3"></div>
          </div>
          {/* ---------------------------------- */}

          <BrowserRouter>
            <Navbar />
            <main style={{ position: 'relative', paddingTop: '80px', minHeight: '100vh', paddingBottom: '2rem' }}>
              <AppRouter />
            </main>
          </BrowserRouter>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
