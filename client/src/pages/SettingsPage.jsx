// client/src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { changePassword, deleteAccount, getMyProfile } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('account');

    // Fresh profile data from API
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Change Password state
    const [pwForm, setPwForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [pwLoading, setPwLoading] = useState(false);

    // Delete Account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch fresh profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMyProfile();
                setProfile(response.data);
            } catch (err) {
                // 404 means no profile created yet — that's fine
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePwChange = (e) => {
        setPwForm({ ...pwForm, [e.target.name]: e.target.value });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }
        setPwLoading(true);
        try {
            await changePassword({
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword
            });
            showToast('Password changed successfully!', 'success');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setPwLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await deleteAccount();
            logout();
            navigate('/');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete account', 'error');
            setShowDeleteModal(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Compute achievement badges
    const getBadges = () => {
        if (!profile) return [];
        const badges = [];
        if (profile.linkedin_url || profile.github_url)
            badges.push({ icon: '✅', label: 'Verified', color: '#3b82f6' });
        if (profile.total_ratings >= 1 && profile.rating >= 4.5)
            badges.push({ icon: '🌟', label: 'Top Rated', color: '#f59e0b' });
        if (profile.total_ratings >= 1 && profile.total_ratings < 5 && profile.rating < 4.5)
            badges.push({ icon: '🚀', label: 'Rising Talent', color: '#8b5cf6' });
        return badges;
    };

    // Render star rating
    const renderStars = (rating) => {
        const filled = Math.round(rating || 0);
        return Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ color: i < filled ? '#f59e0b' : '#374151', fontSize: '1rem' }}>★</span>
        ));
    };

    // Profile completion score
    const getCompletion = () => {
        if (!profile) return 0;
        const fields = [
            profile.full_name, profile.tagline, profile.bio,
            profile.skills?.length, profile.profile_image_url,
            profile.linkedin_url || profile.github_url
        ];
        return Math.round((fields.filter(Boolean).length / fields.length) * 100);
    };

    const tabs = [
        { id: 'account',  label: 'Account',     icon: '👤' },
        { id: 'security', label: 'Security',     icon: '🔐' },
        { id: 'danger',   label: 'Danger Zone',  icon: '⚠️' },
    ];

    const badges = getBadges();
    const completionScore = getCompletion();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Manage your profile and account preferences</p>
            </div>

            <div className={styles.layout}>

                {/* ===== SIDEBAR ===== */}
                <aside className={styles.sidebar}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''} ${tab.id === 'danger' ? styles.dangerTabBtn : ''}`}
                        >
                            <span className={styles.tabIcon}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* ===== CONTENT PANEL ===== */}
                <main className={styles.content}>

                    {/* ---- ACCOUNT TAB ---- */}
                    {activeTab === 'account' && (
                        <div className={styles.panel}>

                            {/* Panel header with Edit button */}
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2 className={styles.panelTitle}>My Profile</h2>
                                    <p className={styles.panelSubtitle}>Your public profile and account details</p>
                                </div>
                                {profile && (
                                    <Link to="/profile/edit" className={styles.editProfileBtn}>
                                        ✏️ Edit Profile
                                    </Link>
                                )}
                            </div>

                            {profileLoading ? (
                                <div className={styles.profileLoading}>Loading profile...</div>

                            ) : !profile ? (
                                /* No profile created yet */
                                <div className={styles.noProfileState}>
                                    <div className={styles.noProfileIcon}>👤</div>
                                    <h3>No Profile Yet</h3>
                                    <p>Create your profile to start applying for jobs or receiving proposals.</p>
                                    <Link to="/create-profile" className={styles.createProfileBtn}>
                                        Create Profile
                                    </Link>
                                </div>

                            ) : (
                                <>
                                    {/* Profile identity card */}
                                    <div className={styles.profileCard}>
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
                                        <div className={styles.profileCardInfo}>
                                            <h3 className={styles.profileName}>{profile.full_name}</h3>
                                            <p className={styles.profileTagline}>
                                                {profile.tagline || 'No tagline set'}
                                            </p>
                                            <span className={`${styles.roleBadge} ${user?.role === 'client' ? styles.clientBadge : styles.providerBadge}`}>
                                                {user?.role === 'client' ? '💼 Client' : '🛠️ Provider'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Achievement badges */}
                                    {badges.length > 0 && (
                                        <div className={styles.badgesRow}>
                                            {badges.map((badge, i) => (
                                                <span
                                                    key={i}
                                                    className={styles.achievementBadge}
                                                    style={{ borderColor: badge.color, color: badge.color }}
                                                >
                                                    {badge.icon} {badge.label}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className={styles.statsRow}>
                                        <div className={styles.statItem}>
                                            <div className={styles.starsRow}>
                                                {renderStars(profile.rating)}
                                            </div>
                                            <span className={styles.statLabel}>
                                                {profile.rating ? Number(profile.rating).toFixed(1) : 'No'} Rating
                                            </span>
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

                                    {/* Profile completion bar */}
                                    <div className={styles.completionBar}>
                                        <div className={styles.completionLabel}>
                                            <span>Profile Completion</span>
                                            <span>{completionScore}%</span>
                                        </div>
                                        <div className={styles.completionTrack}>
                                            <div
                                                className={styles.completionFill}
                                                style={{ width: `${completionScore}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Account details */}
                                    <div className={styles.detailsSection}>
                                        <h4 className={styles.detailsSectionTitle}>Account Details</h4>
                                        <div className={styles.detailsGrid}>
                                            <div className={styles.detailItem}>
                                                <label className={styles.detailLabel}>📧 Email</label>
                                                <span className={styles.detailValue}>{profile.email || '—'}</span>
                                            </div>
                                            {profile.phone_number && (
                                                <div className={styles.detailItem}>
                                                    <label className={styles.detailLabel}>📱 Phone</label>
                                                    <span className={styles.detailValue}>{profile.phone_number}</span>
                                                </div>
                                            )}
                                            {profile.linkedin_url && (
                                                <div className={styles.detailItem}>
                                                    <label className={styles.detailLabel}>💼 LinkedIn</label>
                                                    <a
                                                        href={profile.linkedin_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={styles.detailLink}
                                                    >
                                                        View Profile ↗
                                                    </a>
                                                </div>
                                            )}
                                            {profile.github_url && (
                                                <div className={styles.detailItem}>
                                                    <label className={styles.detailLabel}>💻 GitHub</label>
                                                    <a
                                                        href={profile.github_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={styles.detailLink}
                                                    >
                                                        View Profile ↗
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* About Me */}
                                    {profile.bio && (
                                        <div className={styles.detailsSection}>
                                            <h4 className={styles.detailsSectionTitle}>About Me</h4>
                                            <p className={styles.bioText}>{profile.bio}</p>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {profile.skills?.length > 0 && (
                                        <div className={styles.detailsSection}>
                                            <h4 className={styles.detailsSectionTitle}>Skills</h4>
                                            <div className={styles.skillsContainer}>
                                                {profile.skills.map((skill, i) => (
                                                    <span key={i} className={styles.skillBadge}>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ---- SECURITY TAB ---- */}
                    {activeTab === 'security' && (
                        <div className={styles.panel}>
                            <h2 className={styles.panelTitle}>Security Settings</h2>
                            <p className={styles.panelSubtitle}>Keep your account secure</p>

                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>Change Password</h3>
                                <form onSubmit={handleChangePassword} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={pwForm.currentPassword}
                                            onChange={handlePwChange}
                                            placeholder="Enter your current password"
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={pwForm.newPassword}
                                            onChange={handlePwChange}
                                            placeholder="Minimum 6 characters"
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={pwForm.confirmPassword}
                                            onChange={handlePwChange}
                                            placeholder="Repeat new password"
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className={styles.saveButton}
                                        disabled={pwLoading}
                                    >
                                        {pwLoading ? 'Saving...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ---- DANGER ZONE TAB ---- */}
                    {activeTab === 'danger' && (
                        <div className={styles.panel}>
                            <h2 className={`${styles.panelTitle} ${styles.dangerTitle}`}>Danger Zone</h2>
                            <p className={styles.panelSubtitle}>These actions are permanent and cannot be undone.</p>

                            <div className={styles.dangerCard}>
                                <div className={styles.dangerInfo}>
                                    <h3 className={styles.dangerCardTitle}>Delete Account</h3>
                                    <p className={styles.dangerCardText}>
                                        Permanently delete your ProxiWork account. All your profile data,
                                        job history, and records will be removed. You cannot delete your
                                        account if you have active work in progress.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className={styles.deleteButton}
                                    disabled={deleteLoading}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message="Are you absolutely sure? This will permanently delete your account, profile, and all data. This action CANNOT be undone."
            />
        </div>
    );
}
