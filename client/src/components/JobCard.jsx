// client/src/components/JobCard.jsx
import { Link } from 'react-router-dom';
import styles from './JobCard.module.css';

// A helper function to get the right CSS class for each status
const getStatusClass = (status) => {
    switch(status) {
        case 'open': return styles.statusOpen;
        case 'in_progress': return styles.statusInProgress;
        case 'completed': return styles.statusCompleted;
        default: return '';
    }
};

export default function JobCard({ job }) {
  const formattedBudget = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0,
  }).format(job.budget);

  const formattedDate = new Date(job.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Link to={`/jobs/${job.job_id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.header}> {/* New header div */}
          <h3 className={styles.title}>{job.title}</h3>
          <span className={`${styles.statusBadge} ${getStatusClass(job.status)}`}>
            {job.status.replace('_', ' ')}
          </span>
        </div>
        <p className={styles.clientName}>Posted by: {job.client_name || 'A Client'}</p>
        <p className={styles.budget}>{formattedBudget}</p>
        <p className={styles.description}>{job.description.substring(0, 150)}...</p>
        <div className={styles.footer}>
          <span className={styles.date}>Posted on: {formattedDate}</span>
          {job.deadline && (
            <span className={styles.deadline}>Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          )}
        </div>
      </div>
    </Link>
  );
}