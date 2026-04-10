// client/src/components/Navbar.jsx
import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import styles from './Navbar.module.css';
import useClickOutside from '../hooks/useClickOutside';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useClickOutside(dropdownRef, () => setDropdownOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  const isActive = (path) => location.pathname === path;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) markAsRead(notification.notification_id);
    setNotifOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const avatarUrl = profile?.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&background=6366f1&color=fff&bold=true`;

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>

          {/* === BRAND === */}
          <Link to="/" className={styles.brand}>
            <div className={styles.logo}>⚡</div>
            <span className={styles.brandName}>ProxiWork</span>
          </Link>

          {/* === DESKTOP LEFT LINKS === */}
          <div className={styles.leftNav}>
            <Link to="/jobs" className={`${styles.link} ${isActive('/jobs') ? styles.active : ''}`}>
              Find Work
            </Link>
            {user?.role === 'client' && (
              <Link to="/jobs/new" className={`${styles.link} ${isActive('/jobs/new') ? styles.active : ''}`}>
                Post a Job
              </Link>
            )}
            {user?.role === 'client' && (
              <Link to="/dashboard" className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}>
                Dashboard
              </Link>
            )}
            {user?.role === 'provider' && (
              <Link to="/my-proposals" className={`${styles.link} ${isActive('/my-proposals') ? styles.active : ''}`}>
                My Proposals
              </Link>
            )}
            {user && (
              <Link to="/messages" className={`${styles.link} ${isActive('/messages') ? styles.active : ''}`}>
                Messages
              </Link>
            )}
          </div>

          {/* === RIGHT SIDE === */}
          <div className={styles.navLinks}>
            {user ? (
              <>
                {/* NOTIFICATION BELL */}
                <div className={styles.notifMenu} ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className={styles.notifButton}
                    aria-label="Notifications"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className={styles.notifDropdown}>
                      <h3 className={styles.notifHeader}>Notifications</h3>
                      {notifications.length > 0 ? (
                        <div className={styles.notifList}>
                          {notifications.slice(0, 10).map(notif => (
                            <div
                              key={notif.notification_id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`${styles.notifItem} ${!notif.is_read ? styles.unread : ''}`}
                            >
                              <p className={styles.notifMessage}>{notif.message}</p>
                              <span className={styles.notifDate}>{timeAgo(notif.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.noNotif}>✨ You're all caught up!</p>
                      )}
                    </div>
                  )}
                </div>

                {/* PROFILE MENU */}
                <div className={styles.profileMenu} ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={styles.profileButton}
                  >
                    <img src={avatarUrl} alt="Avatar" className={styles.navAvatar} />
                    <span>{profile?.full_name?.split(' ')[0] || 'Profile'}</span>
                    <span className={styles.chevron}>▼</span>
                  </button>

                  {dropdownOpen && (
                    <div className={styles.dropdown}>
                      {user.hasProfile ? (
                        <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          👤 View Profile
                        </Link>
                      ) : (
                        <Link to="/create-profile" className={styles.dropdownItemHighlight} onClick={() => setDropdownOpen(false)}>
                          ✨ Complete Profile
                        </Link>
                      )}
                      <Link to="/complaint" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        🛡️ Support
                      </Link>
                      <div className={styles.dropdownDivider} />
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className={styles.dropdownItem}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}>Sign In</Link>
                <Link to="/register" className={styles.registerButton}>Get Started</Link>
              </>
            )}

            {/* HAMBURGER */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* === MOBILE MENU === */}
        <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ''}`}>
          <Link to="/jobs" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>🔍 Find Work</Link>
          {user?.role === 'client' && (
            <Link to="/jobs/new" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>📝 Post a Job</Link>
          )}
          {user?.role === 'client' && (
            <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>📊 Dashboard</Link>
          )}
          {user?.role === 'provider' && (
            <Link to="/my-proposals" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>📋 My Proposals</Link>
          )}
          {user && <Link to="/messages" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>💬 Messages</Link>}
          <div className={styles.mobileDivider} />
          {!user ? (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>🔑 Sign In</Link>
              <Link to="/register" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>🚀 Get Started</Link>
            </>
          ) : (
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className={styles.mobileLink}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'Inter, sans-serif' }}
            >
              🚪 Logout
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
