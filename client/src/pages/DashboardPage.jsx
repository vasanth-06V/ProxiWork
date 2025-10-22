// client/src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { getMyJobs, deleteJob, completeJob, submitRating } from '../services/api';
import styles from './DashboardPage.module.css';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import EditJobModal from '../components/EditJobModal';
import RatingModal from '../components/RatingModal';

export default function DashboardPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for Delete Modal ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);

    // --- State for Edit Modal ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);
    
    // --- State for Rating Modal ---
    const [showRatingModal, setShowRatingModal] = useState(false); 
    const [jobToRate, setJobToRate] = useState(null);            

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

    const handleDeleteClick = (job) => {
        setJobToDelete(job);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!jobToDelete) return;
        try {
            await deleteJob(jobToDelete.job_id);
            // Refresh the job list from the server to show the change
            fetchMyJobs(); 
        } catch (err) {
            alert('Failed to delete job. It might already be in progress.');
        } finally {
            setShowDeleteModal(false);
            setJobToDelete(null);
        }
    };

    // --- Handlers for the Edit Modal ---
    const handleEditClick = (job) => {
        setJobToEdit(job);
        setShowEditModal(true);
    };

    const handleJobUpdated = () => {
        // After an update, we just need to refresh the list of jobs
        fetchMyJobs();
    };

    const handleCompleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to mark this job as complete? This will release payment (simulation) and allow you to rate the provider.')) {
            try {
                await completeJob(jobId);
                alert('Job marked as complete!');
                fetchMyJobs(); // Refresh the list to show the 'completed' status
            } catch (err) {
                console.error("Submit Work Error Details:", err.response || err); 
                alert(err.response?.data?.msg || 'Failed to complete job.');
            }
        }
    };

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
            // Optionally, we could update the job locally to hide the rate button,
            // but a full refresh is simpler for now.
            fetchMyJobs(); 
        } catch (err) {
            // Re-throw the error so the modal can display it
            throw err; 
        }
    };

    // ... (keep the getStatusClass function)
    const getStatusClass = (status) => { /* ... same as before ... */ };

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
                            <div className={styles.jobHeader}>
                                <h2 className={styles.jobTitle}>{job.title}</h2>
                                <span className={`${styles.statusBadge} ${getStatusClass(job.status)}`}>
                                    {job.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className={styles.jobDescription}>{job.description.substring(0, 200)}...</p>
                            <div className={styles.jobActions}>
                                {job.status === 'submitted' && (
                                    <button 
                                        onClick={() => handleCompleteJob(job.job_id)} 
                                        className={`${styles.actionButton} ${styles.completeButton}`}
                                    >
                                        Approve & Complete
                                    </button>
                                )}
                                {/* Show a "Chat" button for in-progress jobs */}
                                {job.status === 'in_progress' && (
                                     <Link to={`/projects/${job.job_id}/chat`} className={styles.actionButton}>Chat with Provider</Link>
                                )}
                                {job.status === 'completed' && (
                                    <button onClick={() => handleRateClick(job)} className={`${styles.actionButton} ${styles.rateButton}`}>
                                        Rate Provider
                                    </button>
                                )}
                                <Link to={`/jobs/${job.job_id}/proposals`} className={styles.actionButton}>View Proposals</Link>
                                {/* --- Wire up the Edit button --- */}
                                <button 
                                  onClick={() => handleEditClick(job)}
                                  className={styles.actionButton} 
                                  disabled={job.status !== 'open'}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(job)}
                                  className={`${styles.actionButton} ${styles.deleteButton}`} 
                                  disabled={job.status !== 'open'}
                                >
                                  Delete
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p>You have not posted any jobs yet.</p>
                    )}
                </div>
            </div>
            {/* Add the Confirmation Modal to the page */}
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
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
                jobTitle={jobToRate?.title || ''}
            />
        </>
    );
}