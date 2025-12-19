import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, createOrUpdateProfile, uploadFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
    const { user, updateToken } = useAuth();
    const navigate = useNavigate();
    
    // Create the Ref
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        fullName: '',
        tagline: '',
        bio: '',
        skills: '',
        profile_image_url: '',
        date_of_birth: '',
        phone_number: '',
        linkedin_url: '',
        github_url: ''
    });
    
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMyProfile();
                const p = response.data;
                
                // Format date for input field (YYYY-MM-DD)
                let dob = '';
                if (p.date_of_birth) {
                    dob = new Date(p.date_of_birth).toISOString().split('T')[0];
                }

                setFormData({
                    fullName: p.full_name || '',
                    tagline: p.tagline || '',
                    bio: p.bio || '',
                    skills: p.skills ? p.skills.join(', ') : '',
                    profile_image_url: p.profile_image_url || '',
                    date_of_birth: dob,
                    phone_number: p.phone_number || '',
                    linkedin_url: p.linkedin_url || '',
                    github_url: p.github_url || ''
                });
            } catch (err) {
                // Ignore 404 (Profile not found), just means creating new
                if (err.response && err.response.status !== 404) {
                    setError('Failed to load profile data.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { 
            alert('File size too large (Max 5MB).');
            return;
        }

        try {
            setUploading(true);
            const uploadData = new FormData();
            uploadData.append('file', file);

            const response = await uploadFile(uploadData);
            const { fileUrl } = response.data;

            setFormData(prev => ({ ...prev, profile_image_url: fileUrl }));
            
        } catch (err) {
            console.error("Upload failed", err);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.fullName.trim()) {
            setError('Full Name is required.');
            return;
        }

        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');

            const payload = {
                ...formData,
                skills: skillsArray
            };

            const response = await createOrUpdateProfile(payload);
            
            if (response.data.token) {
                updateToken(response.data.token);
            }

            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update profile.');
        }
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{formData.fullName ? 'Edit Profile' : 'Create Your Profile'}</h1>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                
                {/* --- IMAGE UPLOAD SECTION --- */}
                <div className={styles.imageUploadSection}>
                    <div className={styles.avatarPreview}>
                        {formData.profile_image_url ? (
                            <img src={formData.profile_image_url} alt="Profile" className={styles.avatarImg} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                        {/* Overlay for uploading */}
                        <div className={styles.uploadOverlay} onClick={() => fileInputRef.current.click()}>
                            <span>{uploading ? '...' : '📷'}</span>
                        </div>
                    </div>
                    
                    {/* HIDDEN INPUT LINKED TO REF */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                    />
                    
                    <button 
                        type="button" 
                        className={styles.uploadButton}
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Change Profile Photo'}
                    </button>
                </div>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Full Name *</label>
                        <input 
                            type="text" 
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Professional Tagline</label>
                        <input 
                            type="text" 
                            name="tagline" 
                            value={formData.tagline} 
                            onChange={handleChange} 
                            placeholder="e.g. Senior Web Developer" 
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label>Bio</label>
                        <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange} 
                            rows="4" 
                        ></textarea>
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label>Skills (comma separated)</label>
                        <input 
                            type="text" 
                            name="skills" 
                            value={formData.skills} 
                            onChange={handleChange} 
                            placeholder="React, Node.js, Design..." 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Date of Birth</label>
                        <input 
                            type="date" 
                            name="date_of_birth" 
                            value={formData.date_of_birth} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Phone Number</label>
                        <input 
                            type="tel" 
                            name="phone_number" 
                            value={formData.phone_number} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>LinkedIn URL</label>
                        <input 
                            type="url" 
                            name="linkedin_url" 
                            value={formData.linkedin_url} 
                            onChange={handleChange} 
                            placeholder="https://linkedin.com/in/..." 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>GitHub URL</label>
                        <input 
                            type="url" 
                            name="github_url" 
                            value={formData.github_url} 
                            onChange={handleChange} 
                            placeholder="https://github.com/..." 
                        />
                    </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                
                <button type="submit" className={styles.saveButton}>Save Profile</button>
            </form>
        </div>
    );
}