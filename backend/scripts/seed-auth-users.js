import { query, pool } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';

const users = [
  {
    firstName: 'Portal',
    lastName: 'Admin',
    email: 'admin@coldcreekfarm.com',
    password: 'CcfAdmin123!',
    role: 'ADMIN',
    status: 'active',
  },
  {
    firstName: 'Portal',
    lastName: 'Client',
    email: 'client@coldcreekfarm.com',
    password: 'CcfClient123!',
    role: 'CLIENT',
    status: 'active',
  },
  {
    firstName: 'Inactive',
    lastName: 'User',
    email: 'inactive@coldcreekfarm.com',
    password: 'CcfInactive123!',
    role: 'CLIENT',
    status: 'inactive',
  },
];

const legacyEmails = ['admin@ccf.local', 'client@ccf.local', 'inactive@ccf.local'];

async function seed() {
  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, status, must_change_password)
       VALUES ($1, $2, LOWER($3), $4, $5, $6, FALSE)
       ON CONFLICT (email) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           status = EXCLUDED.status,
           must_change_password = FALSE`,
      [user.firstName, user.lastName, user.email, passwordHash, user.role, user.status],
    );
    console.log(`Seeded ${user.role} user ${user.email}`);
  }

  await query(
    `UPDATE clients
     SET user_id = users.id
     FROM users
     WHERE LOWER(clients.email) = LOWER(users.email)
       AND users.role = 'CLIENT'
       AND clients.user_id IS NULL`,
  );

  await query(`DELETE FROM users WHERE LOWER(email) = ANY($1::text[])`, [
    legacyEmails.map((email) => email.toLowerCase()),
  ]);

  await pool.end();
}

seed().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
