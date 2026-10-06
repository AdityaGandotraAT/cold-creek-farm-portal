import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool, query } from '../src/config/database.js';

async function adminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@coldcreekfarm.com', password: 'CcfAdmin123!' });
  assert.equal(res.status, 200);
  return res.body.token;
}

async function clientToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'client@coldcreekfarm.com', password: 'CcfClient123!' });
  assert.equal(res.status, 200);
  return res.body.token;
}

test('client catalog only includes the test vendor while the product is not live', async () => {
  const admin = await adminToken();
  const client = await clientToken();
  const hiddenName = `Hidden Vendor ${Date.now()}`;

  const hidden = await request(app)
    .post('/api/vendors')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: hiddenName,
      category: 'Photographers',
      email: `hidden.${Date.now()}@email.com`,
    });

  assert.equal(hidden.status, 201);

  const catalog = await request(app)
    .get('/api/client/vendor-selections')
    .set('Authorization', `Bearer ${client}`);

  assert.equal(catalog.status, 200);
  assert.ok(Array.isArray(catalog.body.vendors));
  assert.ok(catalog.body.vendors.some((vendor) => vendor.name === 'Aditya'));
  assert.ok(
    catalog.body.vendors.every(
      (vendor) => String(vendor.email || '').toLowerCase() === 'aditya@agreedtechnologies.com',
    ),
  );
  assert.ok(!catalog.body.vendors.some((vendor) => vendor.name === hiddenName));

  await query('DELETE FROM vendors WHERE id = $1', [hidden.body.vendor.id]);
});

test.after(async () => {
  await pool.end();
});
