// client/src/pages/ProviderDashboard.jsx
import { useState, useEffect } from 'react';
import { getMyProposals } from '../services/api';
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

    useEffect(() => {
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
        fetchMyProposals();
    }, []);

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
                            <p className={styles.bid}>Your Bid: {new Intl.NumberFormat(/*...*/).format(proposal.bid_amount)}</p>
                        </div>
                        <div className={styles.actions}> {/* Add a container for actions */}
                            {proposal.status === 'accepted' && (
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