// client/src/app/register/page.tsx
'use client'; // This tells Next.js that this is a client-side component that can use state and effects.

import React, { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
    // These 'state' variables will hold the data from our form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('provider'); // Default role

    // These will hold any success or error messages from our API
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // This function will run when the form is submitted
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevents the browser from reloading the page
        setError('');
        setSuccess('');

        try {
            const newUser = { email, password, role };

            // We use Axios to send a POST request to our backend's registration endpoint
            const response = await axios.post('http://localhost:5000/api/auth/register', newUser);

            console.log('Registration Success:', response.data);
            setSuccess('Registration successful! You can now log in.');
            // Clear the form
            setEmail('');
            setPassword('');

        } catch (err: any) {
            // If the backend returns an error, we'll display it
            console.error('Registration Error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
        }
    };

    // This is the JSX that defines the look of our page
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2>Register for ProxiWork</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>I am a:</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="provider">Provider (I want to find work)</option>
                        <option value="client">Client (I want to post a job)</option>
                    </select>
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
                    Register
                </button>
            </form>
            {/* These lines will display a success or error message below the form */}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
        </div>
    );
}