// client/src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { getMyJobs, deleteJob, completeJob, submitRating } from '../services/api';
import styles from './DashboardPage.module.css';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import EditJobModal from '../components/EditJobModal';
import RatingModal from '../components/RatingModal';
import PaymentModal from '../components/PaymentModal';

export default function DashboardPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- State for Modals ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [jobToRate, setJobToRate] = useState(null);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [jobToPay, setJobToPay] = useState(null);

    // --- Fetch Data ---
    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            setLoading(true);
            const response = await getMyJobs();
            setJobs(response.data);
        } catch (err) {
            setError('Failed to load your jobs.');
        } finally {
            setLoading(false);
        }
    };

    // --- Delete Handlers ---
    const handleDeleteClick = (job) => {
        setJobToDelete(job);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!jobToDelete) return;
        try {
            await deleteJob(jobToDelete.job_id);
            fetchMyJobs(); 
        } catch (err) {
            alert('Failed to delete job. It might already be in progress or you are not the owner.');
        } finally {
            setShowDeleteModal(false);
            setJobToDelete(null);
        }
    };

    // --- Edit Handlers ---
    const handleEditClick = (job) => {
        setJobToEdit(job);
        setShowEditModal(true);
    };

    const handleJobUpdated = () => {
        fetchMyJobs();
    };

    // --- Payment & Completion Handlers ---
    const handleCompleteClick = (job) => {
        setJobToPay(job);
        setShowPaymentModal(true);
    };

    const confirmPayment = async () => {
        if (!jobToPay) return;
        try {
            await completeJob(jobToPay.job_id);
            alert('Payment released successfully! You can now rate the provider.');
            fetchMyJobs();
        } catch (err) {
             alert(err.response?.data?.msg || 'Failed to complete job.');
        } finally {
            setShowPaymentModal(false);
            setJobToPay(null);
        }
    };

    // --- Rating Handlers ---
    const handleRateClick = (job) => {
        setJobToRate(job);
        setShowRatingModal(true);
    };

    const handleRatingSubmit = async (ratingData) => {
        if (!jobToRate) return;
        try {
            await submitRating(jobToRate.job_id, ratingData);
            alert('Rating submitted successfully!');
            setShowRatingModal(false);
            setJobToRate(null);
            fetchMyJobs(); // This will re-fetch jobs, and is_rated should now be true from backend
        } catch (err) {
            throw err; 
        }
    };

    // Helper for badge colors
    const getStatusClass = (status) => {
        switch(status) {
            case 'open': return styles.statusOpen;
            case 'in_progress': return styles.statusInProgress;
            case 'submitted': return styles.statusSubmitted; 
            case 'completed': return styles.statusCompleted;
            default: return '';
        }
    };

    if (loading) return <p className={styles.centeredMessage}>Loading your dashboard...</p>;
    if (error) return <p className={`${styles.centeredMessage} ${styles.error}`}>{error}</p>;

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>My Job Postings</h1>
                    <Link to="/jobs/new" className={styles.postJobButton}>Post a New Job</Link>
                </div>
                <div className={styles.jobList}>
                    {jobs.length > 0 ? jobs.map(job => (
                        <div key={job.job_id} className={styles.jobCard}>
                            <div className={styles.jobInfo}>
                                <h2 className={styles.jobTitle}>{job.title}</h2>
                                <div className={styles.jobMeta}>
                                    <span>Budget: ₹{job.budget}</span>
                                    <span className={`${styles.statusBadge} ${getStatusClass(job.status)}`}>
                                        {job.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={styles.jobActions}>
                                {/* 1. Approve & Complete (Only when work is submitted) */}
                                {job.status === 'submitted' && (
                                    <button 
                                        onClick={() => handleCompleteClick(job)} 
                                        className={`${styles.actionButton} ${styles.completeButton}`}
                                    >
                                        Approve & Complete
                                    </button>
                                )}

                                {/* 2. Chat (Only when in progress or submitted) */}
                                {(job.status === 'in_progress' || job.status === 'submitted') && (
                                     <Link to={`/projects/${job.job_id}/chat`} className={`${styles.actionButton} ${styles.chatButton}`}>Chat</Link>
                                )}

                                {/* 3. Rate Provider (Only when completed) */}
                                {job.status === 'completed' && (
                                    <button 
                                        onClick={() => handleRateClick(job)}
                                        className={`${styles.actionButton} ${styles.rateButton}`}
                                        disabled={job.is_rated} // LOGIC: Disable if already rated
                                    >
                                        {job.is_rated ? 'Rated' : 'Rate Provider'}
                                    </button>
                                )}

                                {/* 4. View Proposals (ONLY VISIBLE IF OPEN) */}
                                {job.status === 'open' && (
                                    <Link to={`/jobs/${job.job_id}/proposals`} className={`${styles.actionButton} ${styles.viewButton}`}>View Proposals</Link>
                                )}

                                {/* 5. Edit (Only when open) */}
                                {job.status === 'open' && (
                                    <button 
                                        onClick={() => handleEditClick(job)} 
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                    >
                                        Edit
                                    </button>
                                )}

                                {/* 6. Delete (Only when open) */}
                                {job.status === 'open' && (
                                    <button 
                                        onClick={() => handleDeleteClick(job)} 
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <p className={styles.centeredMessage}>You have not posted any jobs yet.</p>
                    )}
                </div>
            </div>

            {/* --- Modals --- */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Job"
                message={`Are you sure you want to permanently delete the job posting "${jobToDelete?.title}"? This action cannot be undone.`}
            />

            <EditJobModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                job={jobToEdit}
                onJobUpdated={handleJobUpdated}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={confirmPayment}
                jobTitle={jobToPay?.title}
                amount={jobToPay?.budget}
            />

            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
                jobTitle={jobToRate?.title || ''}
            />
        </>
    );
}