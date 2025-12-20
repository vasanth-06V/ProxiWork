import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import the shared styles
import styles from '../components/AuthForms.module.css';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
            await login(formData.email, formData.password);
            // Redirect based on role logic could go here, or just dashboard
            navigate('/dashboard'); 
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to continue to ProxiWork</p>
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
                        />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className={styles.footerText}>
                    Don't have an account? <Link to="/register" className={styles.link}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
}