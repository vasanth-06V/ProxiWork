// client/src/pages/JobDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById, submitProposal } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './JobDetailPage.module.css';
import Modal from '../components/Modal';

// --- This is our new Proposal Form Component ---
function ProposalForm({ jobId, onClose }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await submitProposal(jobId, { cover_letter: coverLetter, bid_amount: bidAmount });
      alert('Proposal submitted successfully!');
      onClose(); // Close the modal
      navigate('/jobs'); // Redirect back to the job board
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit proposal.');
    }
  };

  return (
    <form onSubmit={handleProposalSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="coverLetter" className={styles.label}>Cover Letter</label>
        <textarea id="coverLetter" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} required className={styles.textarea} />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="bidAmount" className={styles.label}>Your Bid Amount (INR)</label>
        <input id="bidAmount" type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} required className={styles.input} placeholder="e.g., 20000" />
      </div>
      {error && <p className={`${styles.error} ${styles.message}`}>{error}</p>}
      <button type="submit" className={styles.applyButton}>Submit Proposal</button>
    </form>
  );
}


export default function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- THIS IS THE CORRECTED DATA-FETCHING LOGIC ---
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await getJobById(jobId);
        setJob(response.data);
      } catch (err) {
        setError('Failed to load job details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const ApplyButtonLogic = () => {
    const { user } = useAuth();
    if (!user) return <Link to="/login" className={styles.applyButton}>Login to Apply</Link>;
    if (user.role !== 'provider') return null;
    if (!user.hasProfile) return <Link to="/create-profile" className={styles.applyButton}>Complete Profile to Apply</Link>;

    return <button onClick={() => setIsModalOpen(true)} className={styles.applyButton}>Apply for this Job</button>;
  };

  if (loading) return <div className={styles.centeredMessage}>Loading...</div>;
  if (error) return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;
  if (!job) return <div className={styles.centeredMessage}>Job not found.</div>;

  const formattedBudget = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(job.budget);
  const formattedDate = new Date(job.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' });

  return (
    <>
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
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Apply for: ${job.title}`}>
        <ProposalForm jobId={jobId} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}