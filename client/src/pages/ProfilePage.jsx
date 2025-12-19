import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
    const { user } = useAuth(); // To check role
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div className={styles.loading}>Loading profile...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!profile) return <div className={styles.error}>Profile not found.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                
                {/* --- Header Section --- */}
                <div className={styles.header}>
                    <div className={styles.avatarWrapper}>
                        {profile.profile_image_url ? (
                            <img 
                                src={profile.profile_image_url} 
                                alt={profile.full_name} 
                                className={styles.avatarImg} 
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.headerInfo}>
                        <h1 className={styles.name}>{profile.full_name}</h1>
                        <p className={styles.tagline}>{profile.tagline || 'No tagline set'}</p>
                        <div className={styles.roleBadge}>{user?.role}</div>
                    </div>

                    <Link to="/profile/edit" className={styles.editButton}>
                        Edit Profile
                    </Link>
                </div>

                {/* --- Stats Row --- */}
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>
                            {profile.rating ? Number(profile.rating).toFixed(1) : 'N/A'}
                        </span>
                        <span className={styles.statLabel}>Avg Rating</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{profile.total_ratings || 0}</span>
                        <span className={styles.statLabel}>Reviews</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>
                            {new Date(profile.created_at || Date.now()).getFullYear()}
                        </span>
                        <span className={styles.statLabel}>Member Since</span>
                    </div>
                </div>

                {/* --- Main Content Grid --- */}
                <div className={styles.contentGrid}>
                    
                    {/* About Section */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>About Me</h2>
                        <p className={styles.bio}>
                            {profile.bio || 'This user hasn\'t written a bio yet.'}
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Contact & Socials</h2>
                        <ul className={styles.contactList}>
                            <li>
                                <span className={styles.icon}>📧</span> 
                                {profile.email}
                            </li>
                            {profile.phone_number && (
                                <li>
                                    <span className={styles.icon}>📱</span> 
                                    {profile.phone_number}
                                </li>
                            )}
                            {profile.linkedin_url && (
                                <li>
                                    <span className={styles.icon}>💼</span> 
                                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer">LinkedIn Profile</a>
                                </li>
                            )}
                            {profile.github_url && (
                                <li>
                                    <span className={styles.icon}>💻</span> 
                                    <a href={profile.github_url} target="_blank" rel="noreferrer">GitHub Profile</a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Skills Section (Full Width) */}
                    <div className={`${styles.section} ${styles.fullWidth}`}>
                        <h2 className={styles.sectionTitle}>Skills</h2>
                        <div className={styles.skillsContainer}>
                            {profile.skills && profile.skills.length > 0 ? (
                                profile.skills.map((skill, index) => (
                                    <span key={index} className={styles.skillBadge}>
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className={styles.noSkills}>No skills listed.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}