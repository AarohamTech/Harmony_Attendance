const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Harmony9757Harmony@db.hgtwhgnschadrwhtimne.supabase.co:5432/postgres';

if (!connectionString) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not defined.');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
