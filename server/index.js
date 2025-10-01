// This line must be at the very top to load your secret key from the .env file
require('dotenv').config(); 

const express = require('express');
const { Pool } = require('pg'); // Import the Pool object from the pg library

const app = express();
const PORT = process.env.PORT || 5000;

// Set up the PostgreSQL connection pool using the secret key from .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        // This is required for connecting to cloud databases like Supabase
        rejectUnauthorized: false 
    }
});

// A quick test to verify the database connection
pool.connect((err, client, release) => {
    if (err) {
        // If there is an error, it will be logged here
        return console.error('Error connecting to the database:', err.stack);
    }
    console.log('✅ Successfully connected to the PostgreSQL database!');
    client.release(); // Release the client back to the pool
});


app.get('/', (req, res) => {
    res.send('Welcome to the ProxiWork API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});