// client/src/pages/ProviderDashboard.jsx
import { useState, useEffect } from 'react';
import { getMyProposals, submitWork } from '../services/api';
import styles from './ProviderDashboard.module.css';
import { Link } from 'react-router-dom';

// Helper function for styling the status badges
const getStatusClass = (status) => {
    switch(status) {
        case 'pending': return styles.statusPending;
        case 'accepted': return styles.statusAccepted;
        case 'rejected': return styles.statusRejected;
        default: return '';
    }
};

export default function ProviderDashboard() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyProposals = async () => {
        try {
            const response = await getMyProposals();
            setProposals(response.data);
        } catch (err) {
            setError('Failed to load your proposals.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProposals();
    }, []);

    const handleSubmitWork = async (jobId) => {
        if (window.confirm('Are you sure you want to submit the final work for this project?')) {
            try {
                await submitWork(jobId);
                alert('Work submitted successfully!');
                fetchMyProposals();
            } catch (err) {
                console.error("Submit Work Error Details:", err.response || err); 
                alert(err.response?.data?.msg || 'Failed to submit work.'); 
            }
        }
    };

    if (loading) return <p className={styles.centeredMessage}>Loading your proposals...</p>;
    if (error) return <p className={`${styles.centeredMessage} ${styles.error}`}>{error}</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Proposals</h1>
            <div className={styles.proposalList}>
                {proposals.length > 0 ? proposals.map(proposal => (
                    <div key={proposal.proposal_id} className={styles.proposalCard}>
                        <div>
                            <h2 className={styles.jobTitle}>{proposal.job_title}</h2>
                            <p className={styles.bid}>
                                Your Bid: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(proposal.bid_amount)}
                            </p>
                            <p className={styles.jobStatus}>Job Status: <span style={{ textTransform: 'capitalize' }}>{proposal.job_status?.replace('_', ' ') || 'N/A'}</span></p>
                        </div>
                        <div className={styles.actions}>
                            {/* Submit Work: Only when accepted and work is in progress */}
                            {proposal.status === 'accepted' && proposal.job_status === 'in_progress' && (
                                <button 
                                    onClick={() => handleSubmitWork(proposal.job_id)} 
                                    className={styles.submitButton}
                                >
                                    Submit Final Work
                                </button>
                            )}

                            {/* Chat Button: Show if accepted AND NOT COMPLETED */}
                            {proposal.status === 'accepted' && proposal.job_status !== 'completed' && (
                                <Link to={`/projects/${proposal.job_id}/chat`} className={styles.chatButton}>Chat with Client</Link>
                            )}

                            <span className={`${styles.statusBadge} ${getStatusClass(proposal.status)}`}>
                                {proposal.status}
                            </span>
                        </div>
                    </div>
                )) : (
                    <p className={styles.centeredMessage}>You have not submitted any proposals yet.</p>
                )}
            </div>
        </div>
    );
}