// client/src/context/NotificationContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { getNotifications, markNotificationRead } from '../services/api';
import { useAuth } from './AuthContext';

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
      // Calculate unread count
      const count = response.data.filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  // Fetch when user logs in or changes
  useEffect(() => {
    fetchNotifications();
    // Optional: Set up a polling interval to check for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      // Update local state immediately for a snappy UI
      setNotifications(prev => prev.map(n => 
        n.notification_id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
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