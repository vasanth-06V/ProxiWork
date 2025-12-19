import { useState, useEffect } from 'react';
import { getJobs } from '../services/api';
import styles from './JobBoardPage.module.css';
import { Link } from 'react-router-dom';

export default function JobBoardPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();
        setJobs(response.data);
        setFilteredJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = jobs;

    if (searchTerm) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (budgetFilter) {
      result = result.filter(job => Number(job.budget) >= Number(budgetFilter));
    }

    setFilteredJobs(result);
  }, [searchTerm, budgetFilter, jobs]);

  if (loading) return <div className={styles.container}><p className={styles.loading}>Loading jobs...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Find Work</h1>
        <p className={styles.subtitle}>Browse the latest opportunities</p>
      </div>

      <div className={styles.controls}>
        <input 
          type="text" 
          placeholder="Search for jobs..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select 
          value={budgetFilter} 
          onChange={(e) => setBudgetFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Any Budget</option>
          <option value="1000">Min ₹1,000</option>
          <option value="5000">Min ₹5,000</option>
          <option value="10000">Min ₹10,000</option>
          <option value="50000">Min ₹50,000</option>
        </select>
      </div>

      <div className={styles.jobList}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.job_id} className={styles.jobCard}>
              <div className={styles.jobMain}>
                <h2 className={styles.jobTitle}>{job.title}</h2>
                <div className={styles.jobMeta}>
                    <span className={styles.clientName}>Posted by {job.client_name || 'Anonymous'}</span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.date}>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <p className={styles.jobSnippet}>{job.description.substring(0, 150)}...</p>
              </div>

              <div className={styles.jobSidebar}>
                <div className={styles.budgetBox}>
                  ₹{new Intl.NumberFormat('en-IN').format(job.budget)}
                </div>
                {job.deadline && (
                    <div className={styles.deadline}>
                        Due: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                )}
                <Link to={`/jobs/${job.job_id}`} className={styles.viewButton}>
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No jobs found matching your criteria.</p>
            <button onClick={() => {setSearchTerm(''); setBudgetFilter('')}} className={styles.clearButton}>
                Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}