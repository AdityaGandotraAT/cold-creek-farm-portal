import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool, query } from '../src/config/database.js';
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
      return { messageId: 'vendor-reply-test' };
    },
  });
});

test.afterEach(() => {
  __resetMailTransporterForTests();
});

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

async function ensurePortalClientId() {
  const { rows: users } = await query(
    `SELECT id FROM users WHERE LOWER(email) = 'client@coldcreekfarm.com' LIMIT 1`,
  );
  const { rows: existing } = await query(
    `SELECT id FROM clients WHERE user_id = $1 LIMIT 1`,
    [users[0].id],
  );
  if (existing[0]) {
    return String(existing[0].id);
  }
  throw new Error('seeded portal client is required');
}

function replyUrlsFromMail() {
  const html = sentMail.at(-1)?.html || '';
  const accept = html.match(/href="([^"]+decision=accept[^"]*)"/);
  const unavailable = html.match(/href="([^"]+decision=unavailable[^"]*)"/);
  return {
    acceptUrl: accept?.[1] || '',
    unavailableUrl: unavailable?.[1] || '',
  };
}

function tokenFromUrl(url) {
  const decoded = String(url || '').replace(/&amp;/g, '&');
  const parsed = new URL(decoded);
  return parsed.searchParams.get('token') || '';
}

describe('vendor availability replies', () => {
  test('vendor accept emails the client that they are available', async () => {
    const admin = await adminToken();
    const client = await clientToken();
    const clientId = await ensurePortalClientId();
    await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${admin}`)
      .send({
        name: `Reply Couple ${Date.now()}`,
        eventName: `Reply Event ${Date.now()}`,
        eventDate: '2027-09-18',
        eventStartTime: '16:00',
        eventEndTime: '22:00',
        guests: 90,
        bookingStatus: 'Confirmed',
        clientId,
      });
    assert.equal(createRes.status, 201);
    const bookingId = createRes.body.booking.id;

    const saveRes = await request(app)
      .put('/api/client/vendor-selections')
      .set('Authorization', `Bearer ${client}`)
      .send({
        category: 'Videographers',
        vendorName: 'Aditya',
        vendorEmail: 'aditya@agreedtechnologies.com',
      });
    assert.equal(saveRes.status, 200);
    const videographer = saveRes.body.selections.find((item) => item.category === 'Videographers');
    assert.equal(videographer.status, 'Pending');
    assert.equal(sentMail.at(-1).to, 'aditya@agreedtechnologies.com');

    const { acceptUrl } = replyUrlsFromMail();
    assert.ok(acceptUrl);
    const token = tokenFromUrl(acceptUrl);

    const preview = await request(app).get('/api/vendor-replies').query({ token });
    assert.equal(preview.status, 200);
    assert.equal(preview.body.alreadyResponded, false);

    sentMail.length = 0;
    const reply = await request(app).post('/api/vendor-replies').send({
      token,
      decision: 'accept',
    });
    assert.equal(reply.status, 200);
    assert.equal(reply.body.status, 'Confirmed');
    assert.equal(sentMail.at(-1).to, 'client@coldcreekfarm.com');
    assert.match(sentMail.at(-1).subject, /accepted/i);

    await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${admin}`);
  });

  test('vendor not available emails the client to choose another vendor', async () => {
    const admin = await adminToken();
    const client = await clientToken();
    const clientId = await ensurePortalClientId();
    await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${admin}`)
      .send({
        name: `Busy Couple ${Date.now()}`,
        eventName: `Busy Event ${Date.now()}`,
        eventDate: '2027-08-21',
        eventStartTime: '16:00',
        eventEndTime: '22:00',
        guests: 70,
        bookingStatus: 'Confirmed',
        clientId,
      });
    assert.equal(createRes.status, 201);
    const bookingId = createRes.body.booking.id;

    await request(app)
      .put('/api/client/vendor-selections')
      .set('Authorization', `Bearer ${client}`)
      .send({
        category: 'Videographers',
        vendorName: 'Aditya',
        vendorEmail: 'aditya@agreedtechnologies.com',
      });

    const { unavailableUrl } = replyUrlsFromMail();
    const token = tokenFromUrl(unavailableUrl);
    sentMail.length = 0;

    const reply = await request(app).post('/api/vendor-replies').send({
      token,
      decision: 'unavailable',
    });
    assert.equal(reply.status, 200);
    assert.equal(reply.body.status, 'Unavailable');
    assert.equal(sentMail.at(-1).to, 'client@coldcreekfarm.com');
    assert.match(sentMail.at(-1).subject, /not available/i);
    assert.match(sentMail.at(-1).text, /choose another vendor/i);

    const inbox = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${admin}`);
    assert.ok(
      inbox.body.notifications.some(
        (item) => item.bookingId === bookingId && item.type === 'Vendor unavailable',
      ),
    );

    await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${admin}`);
  });
});

test.after(async () => {
  await pool.end();
});
