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
app.use('/api/auth', require('./src/api/routes/authRoutes')); // --> /api/auth route
app.use('/api/profiles', require('./src/api/routes/profileRoutes.js')); //-->profile route
app.use('/api/jobs', require('./src/api/routes/jobRoutes.js')); //-->job route
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));