import pg from 'pg';
const { Pool } = pg;

const sslMode = String(process.env.PGSSLMODE || process.env.DATABASE_SSL || '').toLowerCase();
const ssl = ['require', 'true', '1'].includes(sslMode) ? { rejectUnauthorized: false } : undefined;

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || 'ypp_admin',
        user: process.env.PGUSER || undefined,
        password: process.env.PGPASSWORD || undefined,
        ssl,
      }
);

export default pool;
