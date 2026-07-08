import pg from 'pg';
import { env, isProd } from './env.js';

const { Pool, types } = pg;

// Return DATE (OID 1082) columns as plain 'YYYY-MM-DD' strings instead of
// JS Date objects, which would otherwise be shifted by the server timezone.
types.setTypeParser(1082, (val) => val);
// Return NUMERIC (OID 1700) as JS number for convenient client-side math.
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

// When DATABASE_URL is provided (Render/production) use it with SSL.
// Otherwise use discrete local params.
const poolConfig = env.db.connectionString
  ? {
      connectionString: env.db.connectionString,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    }
  : {
      host: env.db.host,
      port: env.db.port,
      database: env.db.database,
      user: env.db.user,
      password: env.db.password,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Run a query against the pool.
 * @param {string} text SQL text with $1..$n placeholders
 * @param {any[]} params
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Run a set of statements inside a transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} callback
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
