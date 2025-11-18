const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.AZURE_POSTGRES_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
