// client/src/pages/ProviderDashboard.jsx
import { useState, useEffect } from 'react';
import { getMyProposals, submitWork, withdrawProposal } from '../services/api';
import styles from './ProviderDashboard.module.css';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import SkeletonCard from '../components/SkeletonCard';


// Helper function for styling the status badges
const getStatusClass = (status) => {
    switch(status) {
        case 'pending':     return styles.statusPending;
        case 'shortlisted': return styles.statusShortlisted;
        case 'accepted':    return styles.statusAccepted;
        case 'rejected':    return styles.statusRejected;
        case 'withdrawn':   return styles.statusWithdrawn;
        default: return '';
    }
};

const STATUS_LABELS = {
    pending:     'Pending',
    shortlisted: 'Shortlisted 🌟',
    accepted:    'Hired',
    rejected:    'Rejected',
    withdrawn:   'Withdrawn',
};

export default function ProviderDashboard() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [jobToSubmit, setJobToSubmit] = useState(null);
    const [withdrawingId, setWithdrawingId] = useState(null);


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

   const handleSubmitWork = (jobId) => {
        setJobToSubmit(jobId);
        setShowConfirmModal(true);
    };

    const confirmSubmitWork = async () => {
        try {
            await submitWork(jobToSubmit);
            showToast('Work submitted successfully!', 'success');
            fetchMyProposals();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit work.', 'error');
        } finally {
            setShowConfirmModal(false);
            setJobToSubmit(null);
        }
    };

    const handleWithdraw = async (proposalId) => {
        if (!window.confirm('Are you sure you want to withdraw this proposal? You can re-apply if the job is still open.')) return;
        setWithdrawingId(proposalId);
        try {
            await withdrawProposal(proposalId);
            showToast('Proposal withdrawn.', 'info');
            fetchMyProposals();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to withdraw proposal.', 'error');
        } finally {
            setWithdrawingId(null);
        }
    };


    if (loading) return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Proposals</h1>
            <div className={styles.proposalList}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} rows={2} />
                ))}
            </div>
        </div>
    );

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

                            {/* Withdraw Button: Only for pending or shortlisted proposals */}
                            {['pending', 'shortlisted'].includes(proposal.status) && (
                                <button
                                    onClick={() => handleWithdraw(proposal.proposal_id)}
                                    className={styles.withdrawButton}
                                    disabled={withdrawingId === proposal.proposal_id}
                                >
                                    {withdrawingId === proposal.proposal_id ? 'Withdrawing...' : 'Withdraw'}
                                </button>
                            )}

                            <span className={`${styles.statusBadge} ${getStatusClass(proposal.status)}`}>
                                {STATUS_LABELS[proposal.status] || proposal.status}
                            </span>
                        </div>
                    </div>
                )) : (
                    <p className={styles.centeredMessage}>You have not submitted any proposals yet.</p>
                )}
            </div>
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmSubmitWork}
                title="Submit Final Work"
                message="Are you sure you want to submit the final work for this project? This cannot be undone."
            />
        </div>
    );
}