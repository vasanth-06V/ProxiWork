// client/src/components/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.leftNav}>
          <Link to="/" className={styles.brand}>
            ProxiWork
          </Link>
          <Link to="/jobs" className={styles.link}>
            Find Work
          </Link>
          {user && user.role === 'client' && (
            <Link to="/jobs/new" className={styles.link}>
              Post a Job
            </Link>
          )}
        </div>
        <div className={styles.navLinks}>
          {user ? (
            <div className={styles.profileMenu}>
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