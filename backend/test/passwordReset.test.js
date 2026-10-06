import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool, query } from '../src/config/database.js';
import { createUser } from '../src/services/authService.js';
import {
  __resetMailTransporterForTests,
  __setMailTransporterForTests,
} from '../src/services/emailService.js';

const sentMail = [];

test.beforeEach(() => {
  sentMail.length = 0;
  __setMailTransporterForTests({
    async sendMail(mail) {
      sentMail.push(mail);
      return { messageId: 'reset-test' };
    },
  });
});

test.afterEach(() => {
  __resetMailTransporterForTests();
});

function tokenFromMail(mail) {
  const match = String(mail?.text || '').match(/token=([^\s]+)/);
  assert.ok(match, 'reset email should include a token');
  return decodeURIComponent(match[1]);
}

test('forgot password emails a one-time reset link', async () => {
  const email = `reset-${Date.now()}@coldcreekfarm.test`;
  const user = await createUser({
    firstName: 'Reset',
    lastName: 'Tester',
    email,
    password: 'OldPassword123',
    role: 'ADMIN',
  });

  try {
    const unknown = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody-reset@coldcreekfarm.test' });
    assert.equal(unknown.status, 200);
    assert.equal(sentMail.length, 0);

    const sent = await request(app).post('/api/auth/forgot-password').send({ email });
    assert.equal(sent.status, 200);
    assert.match(sent.body.message, /reset link/i);
    assert.equal(sentMail.length, 1);
    assert.equal(String(sentMail[0].to).toLowerCase(), email);

    const token = tokenFromMail(sentMail[0]);
    const tooShort = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'short' });
    assert.equal(tooShort.status, 400);

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'NewPassword123' });
    assert.equal(reset.status, 200);

    const reused = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'AnotherPassword123' });
    assert.equal(reused.status, 400);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'OldPassword123' });
    assert.equal(oldLogin.status, 401);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'NewPassword123' });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.mustChangePassword, false);
  } finally {
    await query('DELETE FROM users WHERE id = $1', [user.id]);
  }
});

test('reset password rejects a missing token', async () => {
  const res = await request(app).post('/api/auth/reset-password').send({ newPassword: 'NewPassword123' });
  assert.equal(res.status, 400);
});

test.after(async () => {
  await pool.end();
});
