// client/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './HomePage.module.css';

function HomePage() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      {user && !user.hasProfile && (
        <div className={styles.banner}>
          <p>Welcome! Complete your profile to start using ProxiWork.</p>
          <Link to="/create-profile" className={styles.bannerButton}>Complete Profile</Link>
        </div>
      )}

      <h1>Welcome to ProxiWork</h1>
      <p>The secure platform for local services.</p>
    </div>
  );
}

export default HomePage;