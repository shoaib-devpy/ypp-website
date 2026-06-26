import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  database: 'ypp_admin',
  host: 'localhost',
  port: 5432,
});

export default pool;
