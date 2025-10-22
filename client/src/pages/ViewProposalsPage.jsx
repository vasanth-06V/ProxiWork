// client/src/pages/ViewProposalsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, getProposalsForJob, acceptProposal, rejectProposal } from '../services/api';
import ProposalCard from '../components/ProposalCard';
import styles from './ViewProposalsPage.module.css';

export default function ViewProposalsPage() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both the job details and the proposals at the same time
                const jobResponse = await getJobById(jobId);
                const proposalsResponse = await getProposalsForJob(jobId);
                setJob(jobResponse.data);
                setProposals(proposalsResponse.data);
            } catch (err) {
                setError('Failed to load proposals. You may not be the owner of this job.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId]);

    const handleAcceptProposal = async (proposalId) => {
        if (window.confirm('Are you sure you want to accept this proposal? This will close the job to new applications.')) {
            try {
                await acceptProposal(proposalId);
                alert('Proposal accepted! The job is now in progress.');
                // Redirect back to the dashboard to see the updated job status
                navigate('/dashboard');
            } catch (err) {
                alert('Failed to accept proposal. Please try again.');
            }
        }
    };

    const handleRejectProposal = async (proposalId) => {
        if (window.confirm('Are you sure you want to reject this proposal?')) {
            try {
                await rejectProposal(proposalId);
                // Refresh the list to show the 'rejected' status visually
                setProposals(prev => prev.map(p => 
                    p.proposal_id === proposalId ? { ...p, status: 'rejected' } : p
                ));
                alert('Proposal rejected.');
            } catch (err) {
                alert('Failed to reject proposal. Please try again.');
            }
        }
    };
    
    if (loading) return <p className={styles.centeredMessage}>Loading proposals...</p>;
    if (error) return <p className={`${styles.centeredMessage} ${styles.error}`}>{error}</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Proposals for "{job?.title}"</h1>
            {proposals.length > 0 ? (
                <div className={styles.proposalList}>
                    {proposals.map(p => (
                        <ProposalCard 
                            key={p.proposal_id} 
                            proposal={p}
                            onAccept={handleAcceptProposal}
                            onReject={handleRejectProposal}
                            isJobOpen={job?.status === 'open'}
                        />
                    ))}
                </div>
            ) : (
                <p className={styles.centeredMessage}>No proposals have been submitted for this job yet.</p>
            )}
        </div>
    );
}