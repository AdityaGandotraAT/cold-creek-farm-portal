import pg from 'pg';
import { env } from './index.js';

const { Pool } = pg;

const ssl =
  env.database.ssl || Boolean(env.database.url)
    ? { rejectUnauthorized: false }
    : undefined;

export const pool = env.database.url
  ? new Pool({
      connectionString: env.database.url,
      ssl,
      connectionTimeoutMillis: 5000,
    })
  : new Pool({
      host: env.database.host,
      port: env.database.port,
      database: env.database.name,
      user: env.database.user,
      password: env.database.password,
      ssl,
      connectionTimeoutMillis: 5000,
    });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors once the original failure is known.
    }
    throw err;
  } finally {
    client.release();
  }
}
