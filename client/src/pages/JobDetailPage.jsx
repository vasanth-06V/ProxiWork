import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getJobById, submitProposal } from "../services/api";
import { useAuth } from "../context/AuthContext";
import styles from "./JobDetailPage.module.css";
import Modal from "../components/Modal";
import { useToast } from '../context/ToastContext';

export default function JobDetailPage() {
    const { jobId } = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    // Proposal Form State
    const [coverLetter, setCoverLetter] = useState("");
    const [bidAmount, setBidAmount] = useState("");
    const [answers, setAnswers] = useState([]); // Array of answer strings matching job_questions

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await getJobById(jobId);
                const jobData = response.data;
                setJob(jobData);

                // Initialize answer slots based on job_questions count
                if (jobData.job_questions && Array.isArray(jobData.job_questions)) {
                    setAnswers(new Array(jobData.job_questions.length).fill(''));
                }
            } catch (error) {
                console.error("Failed to fetch job details", error);
            } finally {
                setLoading(false);
            }
        };
        if (jobId) fetchJob();
    }, [jobId]);

    const handleAnswerChange = (index, value) => {
        const updated = [...answers];
        updated[index] = value;
        setAnswers(updated);
    };

    const handleProposalSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                cover_letter: coverLetter,
                bid_amount: bidAmount,
            };
            // Only include answers if there are questions
            if (job.job_questions && job.job_questions.length > 0) {
                payload.proposal_answers = answers;
            }
            await submitProposal(jobId, payload);
            showToast('Proposal submitted successfully!', 'success');
            setShowModal(false);
            setHasApplied(true);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit proposal.', 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Loading job details...</div>;
    if (!job) return <div className={styles.notFound}>Job not found.</div>;

    const isClient = user?.role === "client";
    const isProvider = user?.role === "provider";
    const hasProfile = user?.hasProfile;
    const isJobOpen = job.status === 'open';
    const hasQuestions = job.job_questions && Array.isArray(job.job_questions) && job.job_questions.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                {/* Header Section */}
                <div className={styles.header}>
                    <h1 className={styles.title}>{job.title}</h1>
                    <span className={`${styles.statusBadge} ${styles[job.status]}`}>
                        {job.status.replace("_", " ")}
                    </span>
                </div>

                {/* Key Details Grid */}
                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Budget</span>
                        <span className={styles.metaValue}>
                            ₹{new Intl.NumberFormat("en-IN").format(job.budget)}
                        </span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Posted By</span>
                        <span className={styles.metaValue}>{job.client_name || "Client"}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Posted On</span>
                        <span className={styles.metaValue}>
                            {new Date(job.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Deadline</span>
                        <span className={styles.metaValue}>
                            {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No Deadline"}
                        </span>
                    </div>
                    {job.proposal_count !== undefined && (
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Proposals</span>
                            <span className={styles.metaValue}>{job.proposal_count}</span>
                        </div>
                    )}
                </div>

                {/* Description Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Description</h3>
                    <p className={styles.description}>{job.description}</p>
                </div>

                {/* Proposal Questions — shown to providers if questions exist */}
                {hasQuestions && isProvider && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Proposal Questions</h3>
                        <p className={styles.sectionHint}>The client requires answers to these questions.</p>
                        <ol className={styles.questionList}>
                            {job.job_questions.map((q, i) => (
                                <li key={i} className={styles.questionItem}>{q}</li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Action Buttons */}
                <div className={styles.actions}>
                    {/* Provider Apply Button */}
                    {isProvider && isJobOpen && (
                        hasProfile ? (
                            hasApplied ? (
                                <span className={styles.appliedBadge}>✓ Proposal Submitted</span>
                            ) : (
                                <button onClick={() => setShowModal(true)} className={styles.applyButton}>
                                    Apply Now
                                </button>
                            )
                        ) : (
                            <Link to="/create-profile" className={styles.completeProfileBtn}>
                                Complete Profile to Apply
                            </Link>
                        )
                    )}

                    {/* Client View Proposals Button */}
                    {isClient && user.id === job.client_id && (
                        <Link to={`/jobs/${jobId}/proposals`} className={styles.viewProposalsBtn}>
                            View Proposals
                            {job.proposal_count > 0 && (
                                <span className={styles.proposalCountBadge}>{job.proposal_count}</span>
                            )}
                        </Link>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`Apply for "${job.title}"`}
            >
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

                    {/* Dynamic question answer fields */}
                    {hasQuestions && (
                        <div className={styles.answersSection}>
                            <h4 className={styles.answersTitle}>Questions from Client</h4>
                            {job.job_questions.map((question, i) => (
                                <div key={i} className={styles.formGroup}>
                                    <label>Q{i + 1}: {question}</label>
                                    <textarea
                                        value={answers[i] || ''}
                                        onChange={(e) => handleAnswerChange(i, e.target.value)}
                                        required
                                        rows="2"
                                        maxLength={500}
                                        className={styles.modalTextarea}
                                        placeholder="Your answer..."
                                    ></textarea>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="submit" className={styles.submitProposalBtn}>
                        Submit Proposal
                    </button>
                </form>
            </Modal>
        </div>
    );
}
