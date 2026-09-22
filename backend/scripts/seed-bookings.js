import { pool } from '../src/config/database.js';

async function seed() {
  console.log('Booking seed skipped: dummy booking records are no longer inserted.');
  await pool.end();
}

seed().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
