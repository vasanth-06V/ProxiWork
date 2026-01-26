// server/src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.DATABASE_URL.split('@')[1].split(':')[0].replace('db', 'https://proj-id') || "REPLACE_WITH_SUPABASE_URL"; 

const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_KEY
);

module.exports = supabase;