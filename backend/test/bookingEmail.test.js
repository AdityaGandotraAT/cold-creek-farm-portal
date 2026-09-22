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
      return { messageId: `booking-${sentMail.length}` };
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

async function portalClientId() {
  const { rows } = await query(
    `SELECT id FROM clients WHERE LOWER(email) = 'client@coldcreekfarm.com' LIMIT 1`,
  );
  assert.ok(rows[0]?.id, 'seeded portal client is required');
  return String(rows[0].id);
}

test.beforeEach(() => {
  installMailMock();
});

test.afterEach(() => {
  __resetMailTransporterForTests();
});

test('assigning a client to a booking emails their event details', async () => {
  const token = await adminToken();
  const clientId = await portalClientId();
  await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);

  const createRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Email Couple ${Date.now()}`,
      eventName: `Email Event ${Date.now()}`,
      eventType: 'Wedding',
      eventDate: '2026-11-20',
      eventStartTime: '16:00',
      eventEndTime: '22:00',
      guests: 90,
      bookingStatus: 'Confirmed',
      notes: 'Need extra chairs.',
      clientId,
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.emailSent, true);
  assert.equal(sentMail.length, 1);
  assert.equal(sentMail[0].to, 'client@coldcreekfarm.com');
  if (shouldCopyOwnerOnEmail()) {
    assert.equal(sentMail[0].bcc, env.smtp.ownerEmail);
    assert.equal(sentMail[0].replyTo, env.smtp.replyTo);
  }
  assert.match(sentMail[0].subject, /Your booking/i);
  assert.match(sentMail[0].text, /Need extra chairs/);
  assert.match(sentMail[0].text, /\/client\/booking/);

  const bookingId = createRes.body.booking.id;

  const updateRes = await request(app)
    .put(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: createRes.body.booking.name,
      eventName: createRes.body.booking.eventName,
      eventType: 'Wedding',
      eventDate: '2026-11-20',
      eventStartTime: '16:00',
      eventEndTime: '22:00',
      guests: 95,
      bookingStatus: 'Confirmed',
      clientId,
    });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.emailSent, true);
  assert.equal(sentMail.length, 2);
  assert.match(sentMail[1].subject, /updated/i);

  await request(app)
    .delete(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${token}`);

  await query(
    `UPDATE bookings SET client_id = $1 WHERE reference_number = 'CCF-2026-1029'`,
    [clientId],
  );
});

test('booking is still saved when the client email fails', async () => {
  installMailMock({ fail: true });
  const token = await adminToken();
  const clientId = await portalClientId();
  await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);

  const createRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Email Fail ${Date.now()}`,
      eventName: `Email Fail Event ${Date.now()}`,
      eventDate: '2026-12-02',
      eventStartTime: '15:00',
      eventEndTime: '21:00',
      guests: 70,
      bookingStatus: 'Pending',
      clientId,
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.emailSent, false);
  assert.match(createRes.body.message, /email could not be sent/i);
  assert.ok(createRes.body.booking.id);

  await request(app)
    .delete(`/api/bookings/${createRes.body.booking.id}`)
    .set('Authorization', `Bearer ${token}`);

  await query(
    `UPDATE bookings SET client_id = $1 WHERE reference_number = 'CCF-2026-1029'`,
    [clientId],
  );
});

test.after(async () => {
  await pool.end();
});
