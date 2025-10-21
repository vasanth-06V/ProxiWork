// client/src/components/Navbar.jsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';
import { useTheme } from '../context/ThemeContext';
import useClickOutside from '../hooks/useClickOutside';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null); // 3. Create a ref
  useClickOutside(dropdownRef, () => setDropdownOpen(false)); // 4. Use the hook

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.leftNav}>
          <Link to="/" className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoLetter}>P</span>
            </div>
            ProxiWork
          </Link>
          <Link to="/jobs" className={styles.link}>
            Find Work
          </Link>
          {user && user.role === 'client' && (
            <Link to="/jobs/new" className={styles.link}>Post a Job</Link>
          )}
          {user && user.role === 'client' && (
            <Link to="/dashboard" className={styles.link}>Dashboard</Link>
          )}
          {user && user.role === 'provider' && (
            <Link to="/my-proposals" className={styles.link}>My Proposals</Link>
          )}
        </div>
        <div className={styles.navLinks}>
          <button onClick={toggleTheme} className={styles.themeToggle}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <div className={styles.profileMenu} ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className={styles.profileButton}
              >
                Profile &#9662;
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  {user.hasProfile ? (
                    // --- NEW: If profile is complete, show this ---
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      View Profile
                    </Link>
                  ) : (
                    // --- If profile is NOT complete, show this ---
                    <Link to="/create-profile" className={styles.dropdownItemHighlight} onClick={() => setDropdownOpen(false)}>
                       Complete Profile
                    </Link>
                  )}
                  <Link to="/complaint" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    Support / Complaint
                  </Link>
                  <button onClick={() => { logout(); setDropdownOpen(false); }} className={styles.dropdownItem}>
                    Logout
                  </button>
                </div>
              )}
            </div>
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