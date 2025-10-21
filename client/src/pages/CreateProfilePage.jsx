// client/src/pages/CreateProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './CreateProfilePage.module.css';

export default function CreateProfilePage() {
    const [fullName, setFullName] = useState('');
    const [tagline, setTagline] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState(''); // New state
    const [dateOfBirth, setDateOfBirth] = useState(''); // New state
    const [error, setError] = useState(null);
    
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
                skills: skills.split(',').map(skill => skill.trim()).filter(Boolean),
                profile_image_url: profileImageUrl, // New field
                date_of_birth: dateOfBirth, // New field
            };

            const response = await axios.post('http://localhost:5000/api/profiles', profileData);

            if (response.data.token) {
                updateToken(response.data.token);
            }
            
            alert('Profile saved successfully!');
            navigate('/profile'); // Navigate to their new profile page

        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save profile.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Create Your Profile</h2>
                <p className={styles.subtitle}>
                    This information will be visible to potential clients.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* --- NEW: Profile Image URL Input --- */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="profileImageUrl" className={styles.label}>Profile Image URL</label>
                        <input id="profileImageUrl" type="text" value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} className={styles.input} placeholder="https://..." />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullName" className={styles.label}>Full Name</label>
                        <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={styles.input} />
                    </div>
                    
                    {/* --- NEW: Date of Birth Input --- */}
                     <div className={styles.inputGroup}>
                        <label htmlFor="dateOfBirth" className={styles.label}>Date of Birth</label>
                        <input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={styles.input} />
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