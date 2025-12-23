import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal'; 
import styles from './HomePage.module.css';

export default function HomePage() {
  const { user } = useAuth();
  useScrollReveal();

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`${styles.badge} hidden`}>🚀 The #1 Hyperlocal Marketplace</div>
          <h1 className={`${styles.heroTitle} hidden`}>
            Master Your Talent <br />
            <span className={styles.gradientText}>Power the Local Gig Economy</span>
          </h1>
          <p className={`${styles.heroSubtitle} hidden`}>
            Connect with top-tier professionals in your neighborhood. 
            From quick fixes to major works, ProxiWork makes it happen.
          </p>
          
          <div className={`${styles.ctaGroup} hidden`}>
            {!user ? (
              <>
                <Link to="/register" className={styles.primaryBtn}>Get Started</Link>
                <Link to="/login" className={styles.secondaryBtn}>Sign In</Link>
              </>
            ) : (
              <Link to="/jobs" className={styles.primaryBtn}>Find Work Now</Link>
            )}
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={`${styles.statCard} hidden`}>
          <h3>5k+</h3>
          <p>Active Jobs</p>
        </div>
        <div className={`${styles.statCard} hidden`}>
          <h3>$2M+</h3>
          <p>Paid to Providers</p>
        </div>
        <div className={`${styles.statCard} hidden`}>
          <h3>4.9/5</h3>
          <p>Average Rating</p>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={`${styles.sectionTitle} hidden`}>How It Works</h2>
        
        <div className={styles.grid}>
          <div className={`${styles.glassCard} hidden`}>
            <div className={styles.iconBox}>📝</div>
            <h3 className={styles.gradientText}>Post a Job</h3>
            <p>Describe your needs, set a budget, and get ready for proposals within minutes.</p>
          </div>
          
          <div className={`${styles.glassCard} hidden`}>
            <div className={styles.iconBox}>🤝</div>
            <h3 className={styles.gradientText}>Hire & Chat</h3>
            <p>Review profiles, chat in real-time, and hire the best talent for your project.</p>
          </div>
          
          <div className={`${styles.glassCard} hidden`}>
            <div className={styles.iconBox}>🛡️</div>
            <h3 className={styles.gradientText}>Secure Payment</h3>
            <p>Funds are held securely until the work is completed and approved by you.</p>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={`${styles.ctaBox} hidden`}>
          <h2 >Ready to get to work?</h2>
          <p>Join thousands of users building their dreams on ProxiWork.</p>
          <Link to="/register" className={styles.whiteBtn}>Join ProxiWork Today</Link>
        </div>
      </section>
    </div>
  );
}