// client/src/pages/JobBoardPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { getJobs } from '../services/api';
import JobCard from '../components/JobCard';
import styles from './JobBoardPage.module.css';

export default function JobBoardPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: State for our filters ---
  const [searchTerm, setSearchTerm] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();
        setJobs(response.data);
      } catch (err) {
        setError('Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // --- NEW: Client-side filtering logic ---
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const budgetMatch = maxBudget ? parseFloat(job.budget) <= parseFloat(maxBudget) : true;
      return searchMatch && budgetMatch;
    });
  }, [jobs, searchTerm, maxBudget]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Find Your Next Opportunity</h1>
      
      {/* --- NEW: Filter Bar --- */}
      <div className={styles.filterBar}>
        <input 
          type="text" 
          placeholder="Search by title or keyword..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input 
          type="number"
          placeholder="Max Budget (INR)"
          className={styles.budgetInput}
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
        />
      </div>

      <div className={styles.jobList}>
        {loading && <p>Loading jobs...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard key={job.job_id} job={job} />
          ))
        ) : (
          !loading && <p>No jobs found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}