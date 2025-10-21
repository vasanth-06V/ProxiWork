// client/src/pages/ComplaintPage.jsx
import { useState } from 'react';
import { submitComplaint } from '../services/api';
import styles from './ComplaintPage.module.css';

export default function ComplaintPage() {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const complaintData = { subject, description, evidence_url: evidenceUrl };
            const response = await submitComplaint(complaintData);
            setSuccess(response.data.msg);
            // Clear the form on success
            setSubject('');
            setDescription('');
            setEvidenceUrl('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to submit complaint.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h1 className={styles.title}>Submit a Complaint</h1>
                <p className={styles.subtitle}>
                    If you've experienced an issue with a client or provider, please let us know.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="subject" className={styles.label}>Subject</label>
                        <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="description" className={styles.label}>Detailed Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className={styles.textarea} placeholder="Please provide as much detail as possible..."></textarea>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="evidence" className={styles.label}>Link to Evidence (Optional)</label>
                        <input id="evidence" type="text" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} className={styles.input} placeholder="e.g., URL to screenshots or documents" />
                    </div>
                    <button type="submit" className={styles.button}>Submit Complaint</button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}
            </div>
        </div>
    );
}