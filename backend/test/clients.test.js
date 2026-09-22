import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';

async function adminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@coldcreekfarm.com', password: 'CcfAdmin123!' });

  assert.equal(res.status, 200);
  return res.body.token;
}

const sampleClient = {
  firstName: 'Test',
  lastName: 'Client',
  email: `test.client.${Date.now()}@email.com`,
  primaryPhone: '(706) 555-0100',
  address: '100 Test Farm Road',
  city: 'Dawsonville',
  state: 'GA',
  zipCode: '30534',
  country: 'United States',
};

test('admin can create, read, and update clients', async () => {
  const token = await adminToken();

  const createRes = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send(sampleClient);

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.status, 'ok');
  assert.ok(createRes.body.client.id);
  assert.match(createRes.body.client.referenceNumber, /^CCF-\d{4}-\d+$/);

  const clientId = createRes.body.client.id;

  const getRes = await request(app)
    .get(`/api/clients/${clientId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.client.email, sampleClient.email.toLowerCase());

  const listRes = await request(app)
    .get('/api/clients')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.clients.some((client) => client.id === clientId));

  const updateRes = await request(app)
    .put(`/api/clients/${clientId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...sampleClient, city: 'Cumming' });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.client.city, 'Cumming');

  const deleteRes = await request(app)
    .delete(`/api/clients/${clientId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.body.status, 'ok');

  const missingRes = await request(app)
    .get(`/api/clients/${clientId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(missingRes.status, 404);
});

test('clients routes require admin auth', async () => {
  const missing = await request(app).get('/api/clients');
  assert.equal(missing.status, 401);

  const clientLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'client@coldcreekfarm.com', password: 'CcfClient123!' });

  const forbidden = await request(app)
    .get('/api/clients')
    .set('Authorization', `Bearer ${clientLogin.body.token}`);

  assert.equal(forbidden.status, 403);
});

test.after(async () => {
  await pool.end();
});
