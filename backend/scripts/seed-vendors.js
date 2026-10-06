import { pool, query } from '../src/config/database.js';
import { seedVendors } from '../../frontend/src/data/vendorsMock.js';

async function seed() {
  for (const vendor of seedVendors) {
    await query(
      `INSERT INTO vendors (name, category, phone, email, website, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (category, name) DO UPDATE
       SET phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           website = EXCLUDED.website,
           status = EXCLUDED.status`,
      [
        vendor.name,
        vendor.category,
        vendor.phone || '',
        vendor.email || '',
        vendor.website || '',
        vendor.status || 'Active',
      ],
    );
  }

  console.log(`Seeded ${seedVendors.length} vendors`);
  await pool.end();
}

seed().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
