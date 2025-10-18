// client/src/pages/HomePage.jsx
import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = [
  { name: 'Development & IT', icon: '💻' },
  { name: 'Design & Creative', icon: '🎨' },
  { name: 'Sales & Marketing', icon: '📈' },
  { name: 'Writing & Translation', icon: '✍️' },
  { name: 'Admin & Support', icon: '👤' },
  { name: 'Finance & Accounting', icon: '💰' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Conditional "Complete Profile" Banner */}
      {user && !user.hasProfile && (
        <div className={styles.banner}>
          <p>Welcome! Complete your profile to start using ProxiWork.</p>
          <Link to="/create-profile" className={styles.bannerButton}>Complete Profile</Link>
        </div>
      )}

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Connecting local talent with opportunity.
          </h1>
          <p className={styles.heroSubtitle}>
            Find skilled professionals in your community or get hired for your expertise. ProxiWork is the trusted platform for local services.
          </p>
          <div className={styles.heroActions}>
            <Link to="/jobs" className={styles.heroButtonPrimary}>Browse Jobs</Link>
            <Link to={user && user.role === 'client' ? '/jobs/new' : '/login'} className={styles.heroButtonSecondary}>
              Post a Job
            </Link>
          </div>
        </div>
      </header>
      
      {/* Categories Section */}
      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>Explore by Category</h2>
        <div className={styles.categoriesGrid}>
          {categories.map(category => (
            <div key={category.name} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}