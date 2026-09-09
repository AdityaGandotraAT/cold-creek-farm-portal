import { query, pool } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';

const users = [
  {
    firstName: 'Portal',
    lastName: 'Admin',
    email: 'admin@ccf.local',
    password: 'CcfAdmin123!',
    role: 'ADMIN',
    status: 'active',
  },
  {
    firstName: 'Portal',
    lastName: 'Client',
    email: 'client@ccf.local',
    password: 'CcfClient123!',
    role: 'CLIENT',
    status: 'active',
  },
  {
    firstName: 'Inactive',
    lastName: 'User',
    email: 'inactive@ccf.local',
    password: 'CcfInactive123!',
    role: 'CLIENT',
    status: 'inactive',
  },
];

async function seed() {
  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, status)
       VALUES ($1, $2, LOWER($3), $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           status = EXCLUDED.status`,
      [user.firstName, user.lastName, user.email, passwordHash, user.role, user.status],
    );
    console.log(`Seeded ${user.role} user ${user.email}`);
  }

  await pool.end();
}

seed().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
