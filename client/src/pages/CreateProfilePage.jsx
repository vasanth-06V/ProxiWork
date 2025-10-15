// client/src/pages/CreateProfilePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './CreateProfilePage.module.css';

export default function CreateProfilePage() {
    const [fullName, setFullName] = useState('');
    const [tagline, setTagline] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [error, setError] = useState(null);
    
    // Get the new updateToken function from our context
    const { updateToken } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const profileData = {
                fullName,
                tagline,
                bio,
                skills: skills.split(',').map(skill => skill.trim())
            };

            // The API call will now return a new token
            const response = await axios.post('http://localhost:5000/api/profiles', profileData);

            // Use our new context function to update the app's state with the new token
            updateToken(response.data.token);
            
            alert('Profile created successfully!');
            navigate('/'); // Redirect to home page

        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create profile.');
        }
    };

    // ... (The return JSX with the form is the same as before)
    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Create Your Profile</h2>
                <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '-1rem', marginBottom: '1.5rem'}}>
                    This information will be visible to potential clients.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullName" className={styles.label}>Full Name</label>
                        <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="tagline" className={styles.label}>Tagline / Professional Title</label>
                        <input id="tagline" type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} required className={styles.input} placeholder="e.g., Expert Web Developer" />
                    </div>
                     <div className={styles.inputGroup}>
                        <label htmlFor="bio" className={styles.label}>About Me</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} required className={styles.textarea} placeholder="Describe your experience and what you offer..."></textarea>
                    </div>
                     <div className={styles.inputGroup}>
                        <label htmlFor="skills" className={styles.label}>Skills (comma-separated)</label>
                        <input id="skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} required className={styles.input} placeholder="e.g., React, Node.js, Graphic Design" />
                    </div>
                    <button type="submit" className={styles.button}>Save Profile</button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
    );
}