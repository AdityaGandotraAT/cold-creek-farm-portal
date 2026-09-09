import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';

async function login(email, password) {
  return request(app).post('/api/auth/login').send({ email, password });
}

test('successful Admin login', async () => {
  const res = await login('admin@ccf.local', 'CcfAdmin123!');

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.user.role, 'ADMIN');
  assert.equal(res.body.user.email, 'admin@ccf.local');
  assert.ok(res.body.token);
  assert.equal(res.body.user.password_hash, undefined);
  assert.equal(res.body.password_hash, undefined);
});

test('successful Client login', async () => {
  const res = await login('client@ccf.local', 'CcfClient123!');

  assert.equal(res.status, 200);
  assert.equal(res.body.user.role, 'CLIENT');
  assert.ok(res.body.token);
  assert.equal(res.body.user.password_hash, undefined);
});

test('incorrect password', async () => {
  const res = await login('admin@ccf.local', 'wrong-password');

  assert.equal(res.status, 401);
  assert.equal(res.body.message, 'Invalid email or password');
});

test('unknown email', async () => {
  const res = await login('unknown@ccf.local', 'CcfAdmin123!');

  assert.equal(res.status, 401);
  assert.equal(res.body.message, 'Invalid email or password');
});

test('inactive user', async () => {
  const res = await login('inactive@ccf.local', 'CcfInactive123!');

  assert.equal(res.status, 403);
  assert.equal(res.body.message, 'Account is inactive');
});

test('missing login fields', async () => {
  const missingBoth = await request(app).post('/api/auth/login').send({});
  const missingPassword = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@ccf.local' });
  const invalidEmail = await request(app)
    .post('/api/auth/login')
    .send({ email: 'not-an-email', password: 'CcfAdmin123!' });

  assert.equal(missingBoth.status, 400);
  assert.equal(missingPassword.status, 400);
  assert.equal(invalidEmail.status, 400);
});

test('invalid authentication token', async () => {
  const missing = await request(app).get('/api/auth/me');
  const invalid = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer not-a-valid-token');

  assert.equal(missing.status, 401);
  assert.equal(invalid.status, 401);
  assert.equal(missing.body.message, 'Invalid or missing token');
  assert.equal(invalid.body.message, 'Invalid or missing token');
});

test('role authorization', async () => {
  const adminLogin = await login('admin@ccf.local', 'CcfAdmin123!');
  const clientLogin = await login('client@ccf.local', 'CcfClient123!');

  const adminOk = await request(app)
    .get('/api/auth/admin')
    .set('Authorization', `Bearer ${adminLogin.body.token}`);
  const clientDenied = await request(app)
    .get('/api/auth/admin')
    .set('Authorization', `Bearer ${clientLogin.body.token}`);
  const clientOk = await request(app)
    .get('/api/auth/client')
    .set('Authorization', `Bearer ${clientLogin.body.token}`);
  const adminDenied = await request(app)
    .get('/api/auth/client')
    .set('Authorization', `Bearer ${adminLogin.body.token}`);

  assert.equal(adminOk.status, 200);
  assert.equal(adminOk.body.role, 'ADMIN');
  assert.equal(clientDenied.status, 403);
  assert.equal(clientOk.status, 200);
  assert.equal(clientOk.body.role, 'CLIENT');
  assert.equal(adminDenied.status, 403);
});

test('authenticated me uses database role', async () => {
  const adminLogin = await login('admin@ccf.local', 'CcfAdmin123!');
  const me = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${adminLogin.body.token}`);

  assert.equal(me.status, 200);
  assert.equal(me.body.user.role, 'ADMIN');
  assert.equal(me.body.user.password_hash, undefined);
});

test.after(async () => {
  await pool.end();
});
