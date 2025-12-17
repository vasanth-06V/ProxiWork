// client/src/components/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationRead } from '../services/api';
import { socket } from '../services/socket';
import { useNavigate } from 'react-router-dom';
import useClickOutside from '../hooks/useClickOutside';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(dropdownRef, () => setIsOpen(false));

  // 1. Initial Fetch
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
        updateUnreadCount(res.data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifications();

    // 2. Real-time Listener
    // Note: We need to ensure the backend emits 'new_notification'
    // For now, we will rely on fetching or socket events if backend supports it.
    // If backend doesn't emit 'new_notification' yet, we'll add it in the next step.
    
  }, []);

  const updateUnreadCount = (list) => {
    const count = list.filter(n => !n.is_read).length;
    setUnreadCount(count);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.notification_id);
        // Optimistically update local state
        const updatedList = notifications.map(n => 
          n.notification_id === notification.notification_id ? { ...n, is_read: true } : n
        );
        setNotifications(updatedList);
        updateUnreadCount(updatedList);
      } catch (err) {
        console.error("Failed to mark read");
      }
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button className={styles.bellButton} onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>Notifications</div>
          <div className={styles.list}>
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div 
                  key={n.notification_id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`${styles.item} ${!n.is_read ? styles.unread : ''}`}
                >
                  <p className={styles.message}>{n.message}</p>
                  <span className={styles.date}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.empty}>No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}