// client/src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { getMyProfile } from '../services/api';
import styles from './ProfilePage.module.css';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // Get user role

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMyProfile();
                setProfile(response.data);
            } catch (err) {
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <p className={styles.centeredMessage}>Loading Profile...</p>;
    if (error) return <p className={`${styles.centeredMessage} ${styles.error}`}>{error}</p>;
    if (!profile) return <p className={styles.centeredMessage}>Profile not found.</p>;

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.header}>
                    <img 
                        src={profile.profile_image_url || `https://ui-avatars.com/api/?name=${profile.full_name.replace(' ', '+')}&background=random`} 
                        alt={profile.full_name} 
                        className={styles.avatar} 
                    />
                    <div className={styles.headerText}>
                        <h1 className={styles.fullName}>{profile.full_name}</h1>
                        <p className={styles.tagline}>{profile.tagline}</p>
                        {user.role === 'provider' && (
                             <div className={styles.rating}>
                                <span>⭐</span> {Number(profile.rating).toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>About Me</h2>
                    <p className={styles.bio}>{profile.bio}</p>
                </div>
                
                {user.role === 'provider' && profile.skills?.length > 0 && (
                     <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Skills</h2>
                        <div className={styles.skillsContainer}>
                            {profile.skills.map(skill => (
                                <span key={skill} className={styles.skillTag}>{skill}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}