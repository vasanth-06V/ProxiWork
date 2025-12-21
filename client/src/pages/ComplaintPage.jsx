import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint, uploadFile } from '../services/api';
// Make sure this file exists in the same folder!
import styles from './ComplaintPage.module.css';

export default function ComplaintPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        evidence_url: ''
    });

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await uploadFile(uploadData);
            // Ensure we handle different response structures if needed
            const fileUrl = response.data.fileUrl || response.data.url;
            setFormData(prev => ({ ...prev, evidence_url: fileUrl }));
        } catch (err) {
            console.error(err);
            alert('Failed to upload evidence file.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.subject || !formData.description) {
            setError("Subject and Description are required.");
            setLoading(false);
            return;
        }

        try {
            await createComplaint(formData);
            alert('Complaint submitted successfully. Our team will review it shortly.');
            navigate('/'); 
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit complaint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Submit a Complaint</h1>
                    <p className={styles.subtitle}>
                        Facing an issue? Let us know and we'll help resolve it.
                    </p>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            placeholder="e.g. Payment issue with Project X"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe the issue in detail..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="6"
                            className={styles.textarea}
                        ></textarea>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Evidence (Optional Screenshot)</label>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                            accept="image/*"
                        />

                        <div className={styles.uploadBox}>
                            <button 
                                type="button" 
                                className={styles.uploadButton}
                                onClick={() => fileInputRef.current.click()}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : '📎 Attach Screenshot'}
                            </button>
                            
                            {formData.evidence_url && (
                                <div className={styles.preview}>
                                    <span>File Attached</span>
                                    <a href={formData.evidence_url} target="_blank" rel="noreferrer" className={styles.viewLink}>View</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading || uploading}>
                        {loading ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
}