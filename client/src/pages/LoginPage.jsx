// client/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import our custom useAuth hook
import styles from './AuthForm.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const { login } = useAuth(); // 2. Get the login function from the context
    const navigate = useNavigate(); // 3. Get the navigate function for redirection

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password); // 4. Call the context's login function
            navigate('/'); // 5. On success, redirect the user to the home page
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