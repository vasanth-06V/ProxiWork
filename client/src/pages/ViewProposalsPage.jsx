import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    getProposalsForJob,
    acceptProposal,
    rejectProposal,
    shortlistProposal,
    viewProposal,
    getJobById
} from '../services/api';
import styles from './ViewProposalsPage.module.css';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

// Status badge color map
const STATUS_LABELS = {
    pending: 'Pending',
    shortlisted: 'Shortlisted',
    accepted: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};

export default function ViewProposalsPage() {
    const { jobId } = useParams();
    const { showToast } = useToast();
    const [proposals, setProposals] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null); // for viewing answers

    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({ open: false, action: null, proposalId: null, title: '', message: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, proposalsRes] = await Promise.all([
                    getJobById(jobId),
                    getProposalsForJob(jobId)
                ]);
                setJob(jobRes.data);
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

    const refreshProposals = async () => {
        const response = await getProposalsForJob(jobId);
        setProposals(response.data);
    };

    // Mark as viewed when expanding a proposal card
    const handleExpand = async (proposal) => {
        const isExpanding = expandedId !== proposal.proposal_id;
        setExpandedId(isExpanding ? proposal.proposal_id : null);

        if (isExpanding && !proposal.is_viewed) {
            try {
                await viewProposal(proposal.proposal_id);
                // Update local state optimistically
                setProposals(prev => prev.map(p =>
                    p.proposal_id === proposal.proposal_id
                        ? { ...p, is_viewed: true }
                        : p
                ));
            } catch (err) {
                // Non-critical, don't show error
                console.error('Failed to mark proposal as viewed', err);
            }
        }
    };

    const openConfirm = (action, proposalId) => {
        const configs = {
            accept: {
                title: 'Hire this Provider?',
                message: 'This will start the project and automatically reject all other proposals. This cannot be undone.',
            },
            reject: {
                title: 'Reject Proposal?',
                message: 'Are you sure you want to reject this proposal?',
            },
            shortlist: {
                title: 'Shortlist this Provider?',
                message: 'The provider will be notified that they have been shortlisted.',
            },
        };
        const cfg = configs[action];
        setConfirmModal({ open: true, action, proposalId, title: cfg.title, message: cfg.message });
    };

    const handleConfirm = async () => {
        const { action, proposalId } = confirmModal;
        setConfirmModal(prev => ({ ...prev, open: false }));

        try {
            if (action === 'accept') {
                await acceptProposal(proposalId);
                showToast('Provider hired! The project has started.', 'success');
            } else if (action === 'reject') {
                await rejectProposal(proposalId);
                showToast('Proposal rejected.', 'info');
            } else if (action === 'shortlist') {
                await shortlistProposal(proposalId);
                showToast('Provider shortlisted!', 'success');
            }
            await refreshProposals();
        } catch (err) {
            showToast(err.response?.data?.message || `Failed to ${action} proposal.`, 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Loading proposals...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    const isJobOpen = job?.status === 'open';
    const hasQuestions = job?.job_questions && Array.isArray(job.job_questions) && job.job_questions.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Proposals</h1>
                <p className={styles.subtitle}>For: <strong>{job?.title}</strong></p>
            </div>

            <div className={styles.proposalList}>
                {proposals.length > 0 ? (
                    proposals.map(proposal => {
                        const isExpanded = expandedId === proposal.proposal_id;
                        const canAct = isJobOpen && !['accepted', 'rejected', 'withdrawn'].includes(proposal.status);

                        return (
                            <div
                                key={proposal.proposal_id}
                                className={`${styles.glassCard} ${proposal.status === 'shortlisted' ? styles.shortlistedCard : ''}`}
                            >
                                {/* Unread badge */}
                                {!proposal.is_viewed && (
                                    <span className={styles.unreadBadge}>New</span>
                                )}

                                {/* Provider Info */}
                                <div className={styles.mainInfo}>
                                    <div className={styles.providerHeader}>
                                        <div className={styles.avatarPlaceholder}>
                                            {proposal.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className={styles.providerName}>{proposal.full_name}</h3>
                                            <p className={styles.tagline}>{proposal.tagline || 'No tagline'}</p>
                                            {proposal.rating > 0 && (
                                                <p className={styles.rating}>
                                                    ⭐ {parseFloat(proposal.rating).toFixed(1)} ({proposal.total_ratings} reviews)
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.bidInfo}>
                                        <span className={styles.label}>Bid Amount:</span>
                                        <span className={styles.amount}>
                                            ₹{new Intl.NumberFormat('en-IN').format(proposal.bid_amount)}
                                        </span>
                                    </div>

                                    {/* Cover Letter */}
                                    <div className={styles.coverLetterBox}>
                                        <p className={styles.coverLetter}>{proposal.cover_letter}</p>
                                    </div>

                                    {/* Proposal Answers Toggle */}
                                    {hasQuestions && proposal.proposal_answers && (
                                        <button
                                            className={styles.toggleAnswersBtn}
                                            onClick={() => handleExpand(proposal)}
                                        >
                                            {isExpanded ? '▲ Hide Answers' : '▼ View Answers'}
                                        </button>
                                    )}

                                    {/* Expanded answers */}
                                    {isExpanded && proposal.proposal_answers && (
                                        <div className={styles.answersContainer}>
                                            {job.job_questions.map((q, i) => (
                                                <div key={i} className={styles.qaBlock}>
                                                    <p className={styles.question}>Q{i + 1}: {q}</p>
                                                    <p className={styles.answer}>
                                                        {proposal.proposal_answers[i] || '—'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className={styles.actions}>
                                    <span className={`${styles.statusBadge} ${styles[proposal.status]}`}>
                                        {STATUS_LABELS[proposal.status] || proposal.status}
                                    </span>

                                    {canAct && (
                                        <div className={styles.buttonGroup}>
                                            {proposal.status === 'pending' && (
                                                <button
                                                    onClick={() => openConfirm('shortlist', proposal.proposal_id)}
                                                    className={styles.shortlistButton}
                                                >
                                                    Shortlist
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openConfirm('accept', proposal.proposal_id)}
                                                className={styles.acceptButton}
                                            >
                                                Hire
                                            </button>
                                            <button
                                                onClick={() => openConfirm('reject', proposal.proposal_id)}
                                                className={styles.rejectButton}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.emptyState}>
                        <p>No proposals received yet.</p>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                onConfirm={handleConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
}