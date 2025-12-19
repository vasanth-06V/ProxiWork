import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProposalsForJob, acceptProposal, rejectProposal, getJobById } from '../services/api';
import styles from './ViewProposalsPage.module.css';

export default function ViewProposalsPage() {
    const { jobId } = useParams();
    const [proposals, setProposals] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, proposalsRes] = await Promise.all([
                    getJobById(jobId),
                    getProposalsForJob(jobId)
                ]);
                setJobTitle(jobRes.data.title);
                setProposals(proposalsRes.data);
            } catch (err) {
                setError('Failed to load proposals.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId]);

    const handleAccept = async (proposalId) => {
        if (!window.confirm('Are you sure you want to accept this proposal? This will start the project.')) return;
        try {
            await acceptProposal(proposalId);
            // Refresh list to show updated status
            const response = await getProposalsForJob(jobId);
            setProposals(response.data);
            alert('Proposal Accepted! You can now chat with the provider.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept proposal.');
        }
    };

    const handleReject = async (proposalId) => {
        if (!window.confirm('Are you sure you want to reject this proposal?')) return;
        try {
            await rejectProposal(proposalId);
            // Optimistic update or refresh
            setProposals(prev => prev.map(p => 
                p.proposal_id === proposalId ? { ...p, status: 'rejected' } : p
            ));
        } catch (err) {
            alert('Failed to reject proposal.');
        }
    };

    if (loading) return <div className={styles.loading}>Loading proposals...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Proposals</h1>
                <p className={styles.subtitle}>For Job: <strong>{jobTitle}</strong></p>
            </div>

            <div className={styles.proposalList}>
                {proposals.length > 0 ? (
                    proposals.map(proposal => (
                        <div key={proposal.proposal_id} className={styles.glassCard}>
                            
                            {/* Provider Info Section */}
                            <div className={styles.mainInfo}>
                                <div className={styles.providerHeader}>
                                    <div className={styles.avatarPlaceholder}>
                                        {proposal.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className={styles.providerName}>{proposal.full_name}</h3>
                                        <p className={styles.tagline}>{proposal.tagline || 'No tagline'}</p>
                                    </div>
                                </div>
                                
                                <div className={styles.bidInfo}>
                                    <span className={styles.label}>Bid Amount:</span>
                                    <span className={styles.amount}>
                                        ₹{new Intl.NumberFormat('en-IN').format(proposal.bid_amount)}
                                    </span>
                                </div>

                                <div className={styles.coverLetterBox}>
                                    <p className={styles.coverLetter}>{proposal.cover_letter}</p>
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className={styles.actions}>
                                <span className={`${styles.statusBadge} ${styles[proposal.status]}`}>
                                    {proposal.status}
                                </span>

                                {proposal.status === 'pending' && (
                                    <div className={styles.buttonGroup}>
                                        <button 
                                            onClick={() => handleAccept(proposal.proposal_id)} 
                                            className={styles.acceptButton}
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => handleReject(proposal.proposal_id)} 
                                            className={styles.rejectButton}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <p>No proposals received yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}