import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool, query } from '../src/config/database.js';
import { env } from '../src/config/index.js';
import {
  __resetMailTransporterForTests,
  __setMailTransporterForTests,
  shouldCopyOwnerOnEmail,
} from '../src/services/emailService.js';
import { verifyPassword } from '../src/utils/password.js';

const sentMail = [];

function installMailMock({ fail = false } = {}) {
  sentMail.length = 0;
  __setMailTransporterForTests({
    async sendMail(options) {
      if (fail) {
        const err = new Error('SMTP connection failed');
        err.code = 'ECONNECTION';
        throw err;
      }
      sentMail.push(options);
      return { messageId: `test-${sentMail.length}` };
    },
  });
}

async function adminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@coldcreekfarm.com', password: 'CcfAdmin123!' });

  assert.equal(res.status, 200);
  return res.body.token;
}

function sampleClient(suffix = Date.now()) {
  return {
    firstName: 'Jordan',
    lastName: 'Lee',
    email: `jordan.lee.${suffix}@email.com`,
    primaryPhone: '(706) 555-0199',
    address: '200 Test Farm Road',
    city: 'Dawsonville',
    state: 'GA',
    zipCode: '30534',
    country: 'United States',
  };
}

test.beforeEach(() => {
  installMailMock();
});

test.afterEach(() => {
  __resetMailTransporterForTests();
});

test('admin onboarding creates client, hashes password, and emails credentials', async () => {
  const token = await adminToken();
  const payload = sampleClient(`ok-${Date.now()}`);

  const createRes = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.emailSent, true);
  assert.ok(createRes.body.client.id);
  assert.equal(createRes.body.client.email, payload.email.toLowerCase());
  assert.ok(createRes.body.client.userId);
  assert.equal(createRes.body.temporaryPassword, undefined);
  assert.equal(createRes.body.client.password_hash, undefined);
  assert.equal(createRes.body.password_hash, undefined);

  const { rows: users } = await query(
    `SELECT email, password_hash, role, must_change_password
     FROM users
     WHERE id = $1`,
    [createRes.body.client.userId],
  );

  assert.equal(users.length, 1);
  assert.equal(users[0].email, payload.email.toLowerCase());
  assert.equal(users[0].role, 'CLIENT');
  assert.equal(users[0].must_change_password, true);
  assert.ok(users[0].password_hash);
  assert.notEqual(users[0].password_hash, payload.email);

  assert.equal(sentMail.length, 1);
  assert.equal(sentMail[0].to, payload.email.toLowerCase());
  if (shouldCopyOwnerOnEmail()) {
    assert.equal(sentMail[0].bcc, env.smtp.ownerEmail);
    assert.equal(sentMail[0].replyTo, env.smtp.replyTo);
  }
  assert.match(sentMail[0].text, /Username:\s*[^\n]+/i);
  assert.match(sentMail[0].text, new RegExp(payload.email.toLowerCase(), 'i'));
  assert.match(sentMail[0].text, /Temporary Password:\s*\S+/i);
  assert.match(sentMail[0].text, /\/login/);
  assert.doesNotMatch(sentMail[0].text, /password_hash/i);
  assert.doesNotMatch(sentMail[0].html, /password_hash/i);

  const tempPasswordMatch = sentMail[0].text.match(/Temporary Password:\s*(\S+)/i);
  assert.ok(tempPasswordMatch);
  const temporaryPassword = tempPasswordMatch[1];
  assert.ok(await verifyPassword(temporaryPassword, users[0].password_hash));

  const loginRes = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: temporaryPassword,
  });

  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.user.role, 'CLIENT');
  assert.equal(loginRes.body.user.mustChangePassword, true);
  assert.equal(loginRes.body.user.password_hash, undefined);

  const changeRes = await request(app)
    .post('/api/auth/change-password')
    .set('Authorization', `Bearer ${loginRes.body.token}`)
    .send({
      currentPassword: temporaryPassword,
      newPassword: 'NewClientPass123!',
    });

  assert.equal(changeRes.status, 200);
  assert.equal(changeRes.body.user.mustChangePassword, false);

  const { rows: afterChange } = await query(
    `SELECT must_change_password, password_hash FROM users WHERE id = $1`,
    [createRes.body.client.userId],
  );
  assert.equal(afterChange[0].must_change_password, false);
  assert.ok(await verifyPassword('NewClientPass123!', afterChange[0].password_hash));

  const portalLogin = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: 'NewClientPass123!',
  });
  assert.equal(portalLogin.status, 200);
  assert.equal(portalLogin.body.user.mustChangePassword, false);

  const clientAccess = await request(app)
    .get('/api/auth/client')
    .set('Authorization', `Bearer ${portalLogin.body.token}`);
  assert.equal(clientAccess.status, 200);

  await request(app)
    .delete(`/api/clients/${createRes.body.client.id}`)
    .set('Authorization', `Bearer ${token}`);
});

test('duplicate and invalid emails are rejected', async () => {
  const token = await adminToken();
  const payload = sampleClient(`dup-${Date.now()}`);

  const first = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
  assert.equal(first.status, 201);

  const duplicate = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
  assert.equal(duplicate.status, 409);

  const invalid = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...payload, email: 'not-an-email' });
  assert.equal(invalid.status, 400);

  await request(app)
    .delete(`/api/clients/${first.body.client.id}`)
    .set('Authorization', `Bearer ${token}`);
});

test('SMTP failure still creates client and reports emailSent false', async () => {
  installMailMock({ fail: true });
  const token = await adminToken();
  const payload = sampleClient(`smtp-${Date.now()}`);

  const createRes = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.emailSent, false);
  assert.match(createRes.body.message, /welcome email could not be sent/i);
  assert.ok(createRes.body.client.id);
  assert.equal(typeof createRes.body.temporaryPassword, 'string');
  assert.match(createRes.body.temporaryPassword, /\S+/);

  const loginRes = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: createRes.body.temporaryPassword,
  });
  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.user.role, 'CLIENT');

  installMailMock({ fail: false });
  const resend = await request(app)
    .post(`/api/clients/${createRes.body.client.id}/resend-welcome`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(resend.status, 200);
  assert.equal(resend.body.emailSent, true);
  assert.equal(sentMail.length, 1);

  await request(app)
    .delete(`/api/clients/${createRes.body.client.id}`)
    .set('Authorization', `Bearer ${token}`);
});

test.after(async () => {
  __resetMailTransporterForTests();
  await pool.end();
});
