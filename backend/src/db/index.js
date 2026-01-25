const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Use connection string from environment variables
// Supabase provides a direct connection string
const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
