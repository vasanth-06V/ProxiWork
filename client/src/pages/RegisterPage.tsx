// client/src/pages/RegisterPage.tsx

import React, { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('provider');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the page from reloading

        // --- THIS IS THE CRUCIAL FIX ---
        // Clear any previous messages right at the start of a new submission
        setError(null);
        setSuccess(null);

        try {
            const newUser = { email, password, role };
            await axios.post('http://localhost:5000/api/auth/register', newUser);

            setSuccess('Registration successful! You can now log in.');
            // Clear the form fields on success for a better user experience
            setEmail('');
            setPassword('');

        } catch (err: any) {
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2>Register for ProxiWork</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}/>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}/>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>I am a:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                        <option value="provider">Provider (I want to find work)</option>
                        <option value="client">Client (I want to post a job)</option>
                    </select>
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
                    Register
                </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
        </div>
    );
}