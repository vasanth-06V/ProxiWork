import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'client' // Default role
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Register API call
            await registerUser(formData);
            
            // On success, redirect to Login
            // (We don't auto-login because the backend register endpoint doesn't return a token)
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            // Handle Joi validation errors or Server errors
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join ProxiWork today</p>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="••••••••"
                            minLength="6"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="role">I want to...</label>
                        <select
                            name="role"
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="client">Hire Professionals (Client)</option>
                            <option value="provider">Find Work (Provider)</option>
                        </select>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className={styles.footerText}>
                    Already have an account? <Link to="/login" className={styles.link}>Log In</Link>
                </p>
            </div>
        </div>
    );
}