// server/index.js
require('dotenv').config();
const express = require('express');
const pool = require('./src/config/db'); // Import from new location

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// This allows our server to accept JSON data in the body of requests
app.use(express.json());

// Test DB Connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('✅ Successfully connected to the PostgreSQL database!');
    }
});

// --- ROUTES ---
app.get('/', (req, res) => res.send('ProxiWork API is running...'));
// Tell our app to use the auth routes for any URL starting with /api/auth
app.use('/api/auth', require('./src/api/routes/authRoutes'));

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));