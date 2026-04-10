// client/src/context/NotificationContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { getNotifications, markNotificationRead } from '../services/api';
import { useAuth } from './AuthContext';
import { socket } from '../services/socket';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await getNotifications();
      setNotifications(response.data);
      const count = response.data.filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  // Fetch on login/mount
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (notif) => {
      // Prepend new notification to the top of the list
      setNotifications(prev => [
        { ...notif, notification_id: Date.now(), is_read: false },
        ...prev
      ]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      // Update local state immediately for snappy UI
      setNotifications(prev =>
        prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refreshNotifications: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
