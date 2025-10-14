// client/src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  // We will add logic here later to show user profile if logged in
  const isLoggedIn = false; 

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          ProxiWork
        </Link>
        <div className={styles.navLinks}>
          {isLoggedIn ? (
            <div>
              {/* This part will be shown when the user is logged in */}
              <span className={styles.username}>Welcome, User!</span>
            </div>
          ) : (
            <>
              {/* This part is for logged-out users */}
              <Link to="/login" className={styles.link}>
                Login
              </Link>
              <Link to="/register" className={`${styles.link} ${styles.registerButton}`}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
