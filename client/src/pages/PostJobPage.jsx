// client/src/pages/PostJobPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/api';
import styles from './PostJobPage.module.css';

export default function PostJobPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const jobData = { title, description, budget: Number(budget) };
            const response = await createJob(jobData);
            // On success, navigate to the new job's detail page
            navigate(`/jobs/${response.data.job_id}`);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to post job. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Post a New Job</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="title" className={styles.label}>Job Title</label>
                        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={styles.input} placeholder="e.g., Build a company website" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="description" className={styles.label}>Job Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className={styles.textarea} placeholder="Describe the work to be done, required skills, and expected deliverables..."></textarea>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="budget" className={styles.label}>Budget (INR)</label>
                        <input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required className={styles.input} placeholder="e.g., 50000" />
                    </div>
                    <button type="submit" className={styles.button}>Post Job</button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
    );
}