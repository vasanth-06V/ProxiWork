// client/src/pages/JobDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './JobDetailPage.module.css';

// A small helper component for the "Apply" button logic
function ApplyButtonLogic() {
  const { user } = useAuth();

  if (!user) {
    // Case 1: User is not logged in
    return (
      <Link to="/login" className={styles.applyButton}>
        Login to Apply
      </Link>
    );
  }

  if (user.role !== 'provider') {
    // Case 2: User is logged in, but is a 'client'
    return null; // Don't show anything
  }

  if (!user.hasProfile) {
    // Case 3: User is a 'provider' but has not completed their profile
    return (
      <div>
        <Link to="/create-profile" className={styles.applyButton}>
          Complete Profile to Apply
        </Link>
        <p className={styles.applyNote}>You must have a complete profile before applying for jobs.</p>
      </div>
    );
  }

  // Case 4: User is a logged-in provider with a complete profile (the "happy path")
  return (
    <button className={styles.applyButton}>
      Apply for this Job
    </button>
  );
}

export default function JobDetailPage() {
  const { jobId } = useParams(); // Gets the ':jobId' from the URL
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await getJobById(jobId);
        setJob(response.data);
      } catch (err) {
        setError('Failed to load job details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]); // Re-run this effect if the jobId in the URL changes

  if (loading) return <p className={styles.centeredMessage}>Loading job details...</p>;
  if (error) return <p className={`${styles.centeredMessage} ${styles.error}`}>{error}</p>;
  if (!job) return <p className={styles.centeredMessage}>Job not found.</p>;

  // Formatting for budget and date
  const formattedBudget = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(job.budget);
  const formattedDate = new Date(job.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' });

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.mainContent}>
          <h1 className={styles.title}>{job.title}</h1>
          <p className={styles.date}>Posted on {formattedDate}</p>
          <div className={styles.divider}></div>
          <p className={styles.description}>{job.description}</p>
        </div>
        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.budget}>{formattedBudget}</h3>
            <p className={styles.budgetLabel}>Budget</p>
            <div className={styles.applySection}>
              <ApplyButtonLogic />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}