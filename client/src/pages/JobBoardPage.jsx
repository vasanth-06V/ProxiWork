// client/src/pages/JobBoardPage.jsx
import { useState, useEffect } from 'react';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import styles from './JobBoardPage.module.css';

export default function JobBoardPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await getJobs();
        setJobs(response.data);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // The empty array means this effect runs only once when the page loads

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Find Your Next Opportunity</h1>
      <div className={styles.jobList}>
        {loading && <p>Loading jobs...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && jobs.map(job => (
          <JobCard key={job.job_id} job={job} />
        ))}
      </div>
    </div>
  );
}