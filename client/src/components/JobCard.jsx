// client/src/components/JobCard.jsx
import { Link } from 'react-router-dom'; // 1. Import Link
import styles from './JobCard.module.css';

export default function JobCard({ job }) {
  const formattedBudget = new Intl.NumberFormat('en-IN', { /* ... */ }).format(job.budget);
  const formattedDate = new Date(job.created_at).toLocaleDateString(/* ... */);

  // 2. Wrap the div in a Link component
  return (
    <Link to={`/jobs/${job.job_id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <h3 className={styles.title}>{job.title}</h3>
        <p className={styles.budget}>{formattedBudget}</p>
        <p className={styles.description}>{job.description.substring(0, 150)}...</p>
        <div className={styles.footer}>
          <span className={styles.date}>Posted on: {formattedDate}</span>
          {/* 3. The button is no longer needed, the whole card is the link! */}
        </div>
      </div>
    </Link>
  );
}