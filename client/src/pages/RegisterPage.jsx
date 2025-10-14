// client/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AuthForm.module.css'; // Use the shared form styles

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('provider');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await axios.post('http://localhost:5000/api/auth/register', { email, password, role });
            setSuccess('Registration successful! Please log in.');
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Create an Account</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
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
                {success && <p className={`${styles.message} ${styles.success}`}>{success}</p>}
                <p className={styles.redirect}>
                    Already have an account? <Link to="/login" className={styles.redirectLink}>Login</Link>
                </p>
            </div>
        </div>
    );
}
