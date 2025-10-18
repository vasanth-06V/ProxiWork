// client/src/components/EditJobModal.jsx
import { useState, useEffect } from 'react';
import { updateJob } from '../services/api';
import Modal from './Modal';
import styles from './EditJobModal.module.css';

export default function EditJobModal({ isOpen, onClose, job, onJobUpdated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [error, setError] = useState(null);

    // This 'useEffect' is crucial. It runs whenever the 'job' prop changes.
    // It pre-fills the form with the data of the job being edited.
    useEffect(() => {
        if (job) {
            setTitle(job.title);
            setDescription(job.description);
            setBudget(job.budget);
        }
    }, [job]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const updatedData = { title, description, budget: Number(budget) };
            await updateJob(job.job_id, updatedData);
            onJobUpdated(); // Tell the parent (Dashboard) to refresh its job list
            onClose();      // Close the modal
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update job.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Job: ${job?.title}`}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="edit-title" className={styles.label}>Job Title</label>
                    <input id="edit-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={styles.input} />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="edit-description" className={styles.label}>Job Description</label>
                    <textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} required className={styles.textarea}></textarea>
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="edit-budget" className={styles.label}>Budget (INR)</label>
                    <input id="edit-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required className={styles.input} />
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.buttonGroup}>
                    <button type="button" onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>Cancel</button>
                    <button type="submit" className={`${styles.button} ${styles.saveButton}`}>Save Changes</button>
                </div>
            </form>
        </Modal>
    );
}