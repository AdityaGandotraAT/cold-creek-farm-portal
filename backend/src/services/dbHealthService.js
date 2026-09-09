import { query } from '../config/database.js';

export async function checkDatabaseConnection() {
  const result = await query('SELECT NOW() AS now');
  return result.rows[0].now;
}
