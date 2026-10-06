import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool, query } from '../src/config/database.js';
import { REQUIRED_VENDOR_CATEGORIES } from '../src/utils/bookingMapper.js';
import { listActiveCategoryNames } from '../src/services/vendorCategoryService.js';

async function adminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@coldcreekfarm.com', password: 'CcfAdmin123!' });
  assert.equal(res.status, 200);
  return res.body.token;
}

test('admin can list, create, and keep vendor categories', async () => {
  const token = await adminToken();
  const listed = await request(app)
    .get('/api/vendor-categories')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(listed.status, 200);
  assert.ok(listed.body.categories.some((category) => category.name === 'Florist'));
  assert.ok(listed.body.categories.some((category) => category.required));

  const name = `Ice Sculpture ${Date.now()}`;
  const created = await request(app)
    .post('/api/vendor-categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, status: 'Active' });

  assert.equal(created.status, 201);
  assert.equal(created.body.category.name, name);
  assert.equal(created.body.category.required, false);

  const duplicate = await request(app)
    .post('/api/vendor-categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, status: 'Active' });
  assert.equal(duplicate.status, 409);

  const names = await listActiveCategoryNames();
  assert.ok(names.includes(name));

  await query('DELETE FROM vendor_categories WHERE id = $1', [created.body.category.id]);
});

test('required categories stay active and keep their name', async () => {
  const token = await adminToken();
  const listed = await request(app)
    .get('/api/vendor-categories')
    .set('Authorization', `Bearer ${token}`);
  const florist = listed.body.categories.find((category) => category.name === 'Florist');
  assert.ok(florist);

  const updated = await request(app)
    .put(`/api/vendor-categories/${florist.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Flowers Only', status: 'Inactive' });

  assert.equal(updated.status, 200);
  assert.equal(updated.body.category.name, 'Florist');
  assert.equal(updated.body.category.status, 'Active');
});

test('vendor selection overview includes required categories', async () => {
  const token = await adminToken();
  const overview = await request(app)
    .get('/api/vendor-categories/overview')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(overview.status, 200);
  assert.ok(Array.isArray(overview.body.categories));
  for (const name of REQUIRED_VENDOR_CATEGORIES) {
    assert.ok(
      overview.body.categories.some((row) => row.category === name),
      `missing ${name}`,
    );
  }
});

test('clients cannot manage vendor categories', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'client@coldcreekfarm.com', password: 'CcfClient123!' });
  assert.equal(login.status, 200);

  const res = await request(app)
    .get('/api/vendor-categories')
    .set('Authorization', `Bearer ${login.body.token}`);
  assert.equal(res.status, 403);
});

test.after(async () => {
  await query(
    `DELETE FROM vendor_categories
     WHERE required = FALSE
       AND name LIKE 'Ice Sculpture %'`,
  );
  await pool.end();
});
