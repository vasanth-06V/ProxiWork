import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext'; 
import styles from './Navbar.module.css';
import useClickOutside from '../hooks/useClickOutside';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications(); 
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false); 
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useClickOutside(dropdownRef, () => setDropdownOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
    setNotifOpen(false);
    if (notification.link) {
        navigate(notification.link);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.leftNav}>
          <Link to="/" className={styles.brand}>
            <div className={styles.logo}><span className={styles.logoLetter}>P</span></div>
            ProxiWork
          </Link>
          <Link to="/jobs" className={styles.link}>Find Work</Link>
          {user && user.role === 'client' && <Link to="/jobs/new" className={styles.link}>Post a Job</Link>}
          {user && user.role === 'client' && <Link to="/dashboard" className={styles.link}>Dashboard</Link>}
          {user && user.role === 'provider' && <Link to="/my-proposals" className={styles.link}>My Proposals</Link>}
          {user && <Link to="/messages" className={styles.link}>Messages</Link>}
        </div>

        <div className={styles.navLinks}>
          
          {user ? (
            <>
              {/* --- NOTIFICATION BELL --- */}
              <div className={styles.notifMenu} ref={notifRef}>
                <button onClick={() => setNotifOpen(!notifOpen)} className={styles.notifButton}>
                  🔔
                  {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className={styles.notifDropdown}>
                    <h3 className={styles.notifHeader}>Notifications</h3>
                    {notifications.length > 0 ? (
                      <div className={styles.notifList}>
                        {notifications.map(notif => (
                          <div 
                            key={notif.notification_id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`${styles.notifItem} ${!notif.is_read ? styles.unread : ''}`}
                          >
                            <p className={styles.notifMessage}>{notif.message}</p>
                            <span className={styles.notifDate}>
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noNotif}>No notifications yet.</p>
                    )}
                  </div>
                )}
              </div>
              {/* --- END NOTIFICATION BELL --- */}

              <div className={styles.profileMenu} ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className={styles.profileButton}>
                  {profile && <img src={profile.profile_image_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`} alt="Avatar" className={styles.navAvatar} />}
                  Profile &#9662;
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    {user.hasProfile ? (
                      <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>View Profile</Link>
                    ) : (
                      <Link to="/create-profile" className={styles.dropdownItemHighlight} onClick={() => setDropdownOpen(false)}>Complete Profile</Link>
                    )}
                    <Link to="/complaint" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Support / Complaint</Link>
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className={styles.dropdownItem}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>Login</Link>
              <Link to="/register" className={`${styles.link} ${styles.registerButton}`}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}