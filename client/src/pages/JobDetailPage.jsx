import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById, submitProposal } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './JobDetailPage.module.css';
import Modal from '../components/Modal';

export default function JobDetailPage() {
    const { jobId } = useParams(); // Changed from 'id' to 'jobId' to match the Router definition
    const { user, profile } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Proposal Form State
    const [coverLetter, setCoverLetter] = useState('');
    const [bidAmount, setBidAmount] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                // Use jobId here
                const response = await getJobById(jobId);
                setJob(response.data);
            } catch (error) {
                console.error("Failed to fetch job details", error);
            } finally {
                setLoading(false);
            }
        };
        // Only run if jobId exists
        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

    const handleApplyClick = () => {
        setShowModal(true);
    };

    const handleProposalSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use jobId here
            await submitProposal(jobId, { cover_letter: coverLetter, bid_amount: bidAmount });
            alert('Proposal submitted successfully!');
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit proposal');
        }
    };

    if (loading) return <div className={styles.loading}>Loading job details...</div>;
    if (!job) return <div className={styles.notFound}>Job not found.</div>;

    // Logic to determine if user can apply
    const isClient = user?.role === 'client';
    const isProvider = user?.role === 'provider';
    const hasProfile = user?.hasProfile;

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                
                {/* Header Section */}
                <div className={styles.header}>
                    <h1 className={styles.title}>{job.title}</h1>
                    <span className={`${styles.statusBadge} ${styles[job.status]}`}>
                        {job.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Key Details Grid */}
                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Budget</span>
                        <span className={styles.metaValue}>₹{new Intl.NumberFormat('en-IN').format(job.budget)}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Posted By</span>
                        <span className={styles.metaValue}>{job.client_name || 'Client'}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Posted On</span>
                        <span className={styles.metaValue}>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Deadline</span>
                        <span className={styles.metaValue}>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No Deadline'}</span>
                    </div>
                </div>

                {/* Description Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Description</h3>
                    <p className={styles.description}>{job.description}</p>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    {isProvider && (
                        hasProfile ? (
                            <button onClick={handleApplyClick} className={styles.applyButton}>
                                Apply Now
                            </button>
                        ) : (
                            <Link to="/create-profile" className={styles.completeProfileBtn}>
                                Complete Profile to Apply
                            </Link>
                        )
                    )}

                    {/* Use jobId in the link */}
                    {isClient && user.id === job.client_id && (
                        <Link to={`/jobs/${jobId}/proposals`} className={styles.viewProposalsBtn}>
                            View Proposals
                        </Link>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Apply for "${job.title}"`}>
                <form onSubmit={handleProposalSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>Your Bid Amount (₹)</label>
                        <input 
                            type="number" 
                            value={bidAmount} 
                            onChange={(e) => setBidAmount(e.target.value)} 
                            required 
                            className={styles.modalInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Cover Letter</label>
                        <textarea 
                            value={coverLetter} 
                            onChange={(e) => setCoverLetter(e.target.value)} 
                            required 
                            rows="5"
                            className={styles.modalTextarea}
                            placeholder="Explain why you are the best fit for this job..."
                        ></textarea>
                    </div>
                    <button type="submit" className={styles.submitProposalBtn}>Submit Proposal</button>
                </form>
            </Modal>
        </div>
    );
}