// server/src/config/db.js
const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' }); // Adjust path to find .env in root

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;