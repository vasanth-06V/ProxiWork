// client/src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import the useAuth hook
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth(); // 2. Get the user and logout function from context

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          ProxiWork
        </Link>
        <div className={styles.navLinks}>
          {user ? ( // 3. Check if the user object exists
            <>
              {/* This part is for LOGGED-IN users */}
              <span className={styles.username}>Welcome, User ID: {user.id}</span>
              <button onClick={logout} className={styles.link}>
                Logout
              </button>
            </>
          ) : (
            <>
              {/* This part is for LOGGED-OUT users */}
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