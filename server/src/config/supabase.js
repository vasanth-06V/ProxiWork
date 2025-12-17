// server/src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// We need these keys. Make sure they are in your .env file!
const supabaseUrl = process.env.DATABASE_URL.split('@')[1].split(':')[0].replace('db', 'https://proj-id') || "REPLACE_WITH_SUPABASE_URL"; 
// Actually, it's safer to just ask you to put the URL in .env manually.
// Let's rely on .env variables.

const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_KEY
);

module.exports = supabase;