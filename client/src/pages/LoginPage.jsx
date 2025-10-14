// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AuthForm.module.css'; // Use the shared form styles

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            console.log('Login Success! Token:', response.data.token);
            alert('Login successful! Check the console for your token.');
            // We will redirect the user in the next session
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Sign In</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} />
                    </div>
                    <button type="submit" className={styles.button}>Login</button>
                </form>
                {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
                <p className={styles.redirect}>
                    Don't have an account? <Link to="/register" className={styles.redirectLink}>Register</Link>
                </p>
            </div>
        </div>
    );
}
