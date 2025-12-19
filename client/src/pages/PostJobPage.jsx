import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/api';
import styles from './PostJobPage.module.css';

export default function PostJobPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        deadline: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createJob(formData);
            navigate('/dashboard'); // Redirect to dashboard after posting
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Post a New Job</h1>
                    <p className={styles.subtitle}>Find the perfect professional for your needs.</p>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Job Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="e.g. Need a plumber for a leaky faucet"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="budget">Budget (₹)</label>
                            <input
                                type="number"
                                id="budget"
                                name="budget"
                                placeholder="5000"
                                value={formData.budget}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="deadline">Deadline</label>
                            <input
                                type="date"
                                id="deadline"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe your project in detail..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="6"
                            className={styles.textarea}
                        ></textarea>
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        Publish Job
                    </button>
                </form>
            </div>
        </div>
    );
}