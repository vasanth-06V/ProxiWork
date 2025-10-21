// client/src/pages/EditProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
    // This state holds all our form data in one object
    const [formData, setFormData] = useState({
        fullName: '', tagline: '', bio: '', skills: '',
        profileImageUrl: '', dateOfBirth: '', phoneNumber: '',
        linkedinUrl: '', githubUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { updateToken } = useAuth();
    const navigate = useNavigate();

    // This runs when the page loads to fetch existing profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMyProfile();
                const { 
                    full_name, tagline, bio, skills, profile_image_url, 
                    date_of_birth, phone_number, linkedin_url, github_url 
                } = response.data;
                
                // Pre-fill the form with the fetched data
                setFormData({
                    fullName: full_name || '',
                    tagline: tagline || '',
                    bio: bio || '',
                    skills: skills?.join(', ') || '',
                    profileImageUrl: profile_image_url || '',
                    dateOfBirth: date_of_birth ? new Date(date_of_birth).toISOString().split('T')[0] : '',
                    phoneNumber: phone_number || '',
                    linkedinUrl: linkedin_url || '',
                    githubUrl: github_url || ''
                });
            } catch (err) {
                console.log("No existing profile found, starting with a fresh form.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // This function updates the state whenever you type in any input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // This function runs when you click "Save Profile"
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // --- THIS IS THE CORRECTED MAPPING ---
            // We are explicitly creating an object with the snake_case keys
            // that our backend API is expecting.
            const profileData = {
                fullName: formData.fullName,
                tagline: formData.tagline,
                bio: formData.bio,
                skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
                profile_image_url: formData.profileImageUrl,
                date_of_birth: formData.dateOfBirth,
                phone_number: formData.phoneNumber,
                linkedin_url: formData.linkedinUrl,
                github_url: formData.githubUrl,
            };
            // --- END OF CORRECTION ---

            const response = await axios.post('http://localhost:5000/api/profiles', profileData);
            
            if (response.data.token) {
                updateToken(response.data.token);
            }
            
            alert('Profile saved successfully!');
            navigate('/profile');

        } catch (err) {
            console.error(err.response || err); // Log the full error for better debugging
            setError(err.response?.data?.msg || 'Failed to save profile. Please check the console for details.');
        }
    };

    if (loading) return <div>Loading form...</div>;

    // --- THIS IS THE NEW, COMPLETE FORM ---
    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Edit Your Profile</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullName" className={styles.label}>Full Name</label>
                        <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="tagline" className={styles.label}>Tagline / Professional Title</label>
                        <input name="tagline" type="text" value={formData.tagline} onChange={handleChange} required className={styles.input} />
                    </div>
                     <div className={styles.inputGroup}>
                        <label htmlFor="profileImageUrl" className={styles.label}>Profile Image URL</label>
                        <input name="profileImageUrl" type="text" value={formData.profileImageUrl} onChange={handleChange} className={styles.input} placeholder="https://..." />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="dateOfBirth" className={styles.label}>Date of Birth</label>
                        <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
                        <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="linkedinUrl" className={styles.label}>LinkedIn Profile URL</label>
                        <input name="linkedinUrl" type="text" value={formData.linkedinUrl} onChange={handleChange} className={styles.input} />
                    </div>
                     <div className={styles.inputGroup}>
                        <label htmlFor="githubUrl" className={styles.label}>GitHub Profile URL</label>
                        <input name="githubUrl" type="text" value={formData.githubUrl} onChange={handleChange} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="bio" className={styles.label}>About Me</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} required className={styles.textarea}></textarea>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="skills" className={styles.label}>Skills (comma-separated)</label>
                        <input name="skills" type="text" value={formData.skills} onChange={handleChange} required className={styles.input} />
                    </div>
                    <button type="submit" className={styles.button}>Save Profile</button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
    );
}