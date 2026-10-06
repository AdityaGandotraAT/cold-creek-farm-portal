import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool, query } from '../src/config/database.js';
import {
  __resetMailTransporterForTests,
  __setMailTransporterForTests,
} from '../src/services/emailService.js';

test.beforeEach(() => {
  __setMailTransporterForTests({
    async sendMail() {
      return { messageId: 'notification-test' };
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

  const { rows: byEmail } = await query(
    `SELECT id FROM clients WHERE LOWER(email) = 'client@coldcreekfarm.com' LIMIT 1`,
  );
  if (byEmail[0]) {
    await query(`UPDATE clients SET user_id = $2 WHERE id = $1`, [byEmail[0].id, users[0].id]);
    return String(byEmail[0].id);
  }

  throw new Error('seeded portal client is required');
}

describe('admin notifications', () => {
  test('clients cannot read the admin notification inbox', async () => {
    const client = await clientToken();
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${client}`);
    assert.equal(res.status, 403);
  });

  test('client vendor pick appears in the admin inbox', async () => {
    const admin = await adminToken();
    const client = await clientToken();
    const clientId = await ensurePortalClientId();
    await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${admin}`)
      .send({
        name: `Notify Couple ${Date.now()}`,
        eventName: `Notify Event ${Date.now()}`,
        eventType: 'Wedding',
        eventDate: '2027-11-14',
        eventStartTime: '16:00',
        eventEndTime: '22:00',
        guests: 80,
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

    const inbox = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${admin}`);

    assert.equal(inbox.status, 200);
    const item = inbox.body.notifications.find(
      (notification) =>
        notification.bookingId === bookingId && notification.relatedName === 'Aditya',
    );
    assert.ok(item);
    assert.equal(item.type, 'Vendor pending reply');
    assert.equal(item.status, 'Unread');
    assert.match(item.title, /selected Aditya/);
    assert.ok(inbox.body.unreadCount >= 1);

    const readRes = await request(app)
      .patch(`/api/notifications/${item.id}/read`)
      .set('Authorization', `Bearer ${admin}`);
    assert.equal(readRes.status, 200);
    assert.equal(readRes.body.notification.status, 'Read');

    await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${admin}`);
  });
});

test.after(async () => {
  await pool.end();
});
