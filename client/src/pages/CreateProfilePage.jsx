// client/src/pages/CreateProfilePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AuthForm.module.css'; // We can reuse our nice form styles

export default function CreateProfilePage() {
    const [fullName, setFullName] = useState('');
    const [tagline, setTagline] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Skills need to be sent as an array of strings
            const skillsArray = skills.split(',').map(skill => skill.trim());
            const profileData = { fullName, tagline, bio, skills: skillsArray };

            // The token is already set in axios headers by our AuthContext
            await axios.post('http://localhost:5000/api/profiles', profileData);

            // On success, redirect to the home page
            navigate('/');

        } catch (err) {
            setError(err.response?.data?.msg || "Failed to create profile.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Create Your Profile</h2>
                <p style={{textAlign: 'center', color: '#A0A0A0', marginTop: '-1rem', marginBottom: '2rem'}}>
                    Complete your profile to start using ProxiWork.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullName" className={styles.label}>Full Name</label>
                        <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="tagline" className={styles.label}>Tagline (e.g., "Full-Stack Web Developer")</label>
                        <input id="tagline" type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className={styles.input} />
                    </div>
                     <div className={styles.inputGroup}>
                        <label htmlFor="bio" className={styles.label}>Bio</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className={styles.input} rows="3"></textarea>
                    </div>
                     <div className={styles.inputGroup}>
                        <label htmlFor="skills" className={styles.label}>Skills (comma separated, e.g., React, Node.js)</label>
                        <input id="skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className={styles.input} />
                    </div>
                    <button type="submit" className={styles.button}>Save Profile</button>
                </form>
                {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
            </div>
        </div>
    );
}
