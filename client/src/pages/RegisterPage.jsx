// client/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth
import styles from './AuthForm.module.css';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('provider');
    const [error, setError] = useState(null);
    
    const { login } = useAuth(); // 2. Get the login function from context
    const navigate = useNavigate(); // 3. Get the navigate function

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Step A: Register the new user
            await axios.post('http://localhost:5000/api/auth/register', { email, password, role });
            
            // Step B: Immediately log them in with their new credentials
            await login(email, password);
            
            // Step C: Redirect them to the create profile page
            navigate('/create-profile');

        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Create an Account</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Form inputs are the same as before */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input}/>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input}/>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="role" className={styles.label}>I am a</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className={styles.select}>
                            <option value="provider">Provider (I want to find work)</option>
                            <option value="client">Client (I want to post a job)</option>
                        </select>
                    </div>
                    <button type="submit" className={styles.button}>Register</button>
                </form>
                {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
                <p className={styles.redirect}>
                    Already have an account? <Link to="/login" className={styles.redirectLink}>Login</Link>
                </p>
            </div>
        </div>
    );
}