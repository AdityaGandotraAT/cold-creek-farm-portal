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
      return { messageId: 'client-portal-test' };
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
  assert.ok(users[0]?.id, 'seeded client user is required');

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

  const { rows } = await query(
    `INSERT INTO clients (
       reference_number,
       first_name,
       last_name,
       email,
       primary_phone,
       address,
       city,
       state,
       zip_code,
       country,
       user_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      `CCF-TEST-${Date.now()}`,
      'Portal',
      'Client',
      'client@coldcreekfarm.com',
      '(706) 555-0100',
      '1 Test Lane',
      'Dawsonville',
      'GA',
      '30534',
      'United States',
      users[0].id,
    ],
  );

  return String(rows[0].id);
}

describe('client portal', { concurrency: false }, () => {
test('client can read only their assigned booking', async () => {
  const admin = await adminToken();
  const client = await clientToken();
  const clientId = await ensurePortalClientId();

  await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);

  const createRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: `Portal Couple ${Date.now()}`,
      eventName: `Portal Event ${Date.now()}`,
      eventType: 'Wedding',
      eventDate: '2026-11-14',
      eventStartTime: '16:00',
      eventEndTime: '22:00',
      guests: 140,
      bookingStatus: 'Confirmed',
      notes: 'Need accessible seating.',
      clientId,
    });

  assert.equal(createRes.status, 201);
  const bookingId = createRes.body.booking.id;
  assert.equal(createRes.body.booking.clientId, clientId);
  assert.equal(createRes.body.booking.eventType, 'Wedding');
  assert.equal(createRes.body.booking.notes, 'Need accessible seating.');

  const myBooking = await request(app)
    .get('/api/client/booking')
    .set('Authorization', `Bearer ${client}`);

  assert.equal(myBooking.status, 200);
  assert.equal(myBooking.body.booking.id, bookingId);
  assert.equal(myBooking.body.booking.clientId, clientId);

  const adminDenied = await request(app)
    .get('/api/client/booking')
    .set('Authorization', `Bearer ${admin}`);
  assert.equal(adminDenied.status, 403);

  const duplicate = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: `Second Couple ${Date.now()}`,
      eventName: `Second Event ${Date.now()}`,
      eventDate: '2026-12-01',
      eventStartTime: '15:00',
      eventEndTime: '21:00',
      guests: 80,
      bookingStatus: 'Pending',
      clientId,
    });
  assert.equal(duplicate.status, 201);
  assert.equal(duplicate.body.booking.clientId, clientId);

  const oldBooking = await request(app)
    .get(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${admin}`);
  assert.equal(oldBooking.body.booking.clientId, null);

  await request(app)
    .delete(`/api/bookings/${duplicate.body.booking.id}`)
    .set('Authorization', `Bearer ${admin}`);

  await request(app)
    .delete(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${admin}`);

  await query(
    `UPDATE bookings
     SET client_id = $1
     WHERE reference_number = 'CCF-2026-1029'`,
    [clientId],
  );
});

test('client booking route requires client auth', async () => {
  const missing = await request(app).get('/api/client/booking');
  assert.equal(missing.status, 401);
});

test('client can save an open vendor selection', async () => {
  const sentMail = [];
  __setMailTransporterForTests({
    async sendMail(options) {
      sentMail.push(options);
      return { messageId: `vendor-${sentMail.length}` };
    },
  });

  const admin = await adminToken();
  const client = await clientToken();
  const clientId = await ensurePortalClientId();
  await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);

  const createRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: `Vendor Couple ${Date.now()}`,
      eventName: `Vendor Event ${Date.now()}`,
      eventType: 'Wedding',
      eventDate: '2027-12-11',
      eventStartTime: '16:00',
      eventEndTime: '22:00',
      guests: 120,
      bookingStatus: 'Confirmed',
      clientId,
    });

  assert.equal(createRes.status, 201);
  const bookingId = createRes.body.booking.id;
  sentMail.length = 0;

  const before = await request(app)
    .get('/api/client/vendor-selections')
    .set('Authorization', `Bearer ${client}`);
  assert.equal(before.status, 200);
  assert.equal(before.body.booking.id, bookingId);
  assert.equal(before.body.lock.status, 'Open');
  assert.ok(before.body.selections.some((row) => row.category === 'Florist'));
  assert.ok(before.body.selections.length >= 6);

  const saveRes = await request(app)
    .put('/api/client/vendor-selections')
    .set('Authorization', `Bearer ${client}`)
    .send({
      category: 'Florist',
      vendorName: 'Posh Petals of Gainesville',
      vendorEmail: 'poshpetals@live.com',
    });

  assert.equal(saveRes.status, 200);
  assert.equal(saveRes.body.emailSent, true);
  const florist = saveRes.body.selections.find((item) => item.category === 'Florist');
  assert.equal(florist.vendor, 'Posh Petals of Gainesville');
  assert.equal(florist.status, 'Pending');
  assert.equal(saveRes.body.booking.selectedCount, 1);
  assert.notEqual(sentMail.at(-1).to, 'poshpetals@live.com');
  assert.equal(sentMail.at(-1).to, 'jeff@coldcreekfarm.com');

  await request(app)
    .delete(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${admin}`);
});

test('client cannot change vendors after the lock date', async () => {
  const admin = await adminToken();
  const client = await clientToken();
  const clientId = await ensurePortalClientId();
  await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);

  const createRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: `Locked Couple ${Date.now()}`,
      eventName: `Locked Event ${Date.now()}`,
      eventDate: '2026-10-01',
      eventStartTime: '16:00',
      eventEndTime: '22:00',
      guests: 90,
      bookingStatus: 'Pending',
      clientId,
    });

  assert.equal(createRes.status, 201);

  const locked = await request(app)
    .put('/api/client/vendor-selections')
    .set('Authorization', `Bearer ${client}`)
    .send({
      category: 'DJs',
      vendorName: 'Diggs Entertainment',
    });

  assert.equal(locked.status, 400);
  assert.match(locked.body.message, /locked/i);

  await request(app)
    .delete(`/api/bookings/${createRes.body.booking.id}`)
    .set('Authorization', `Bearer ${admin}`);
});

test('client can read their profile and only their notifications', async () => {
  const admin = await adminToken();
  const client = await clientToken();
  const clientId = await ensurePortalClientId();

  const account = await request(app)
    .get('/api/client/account')
    .set('Authorization', `Bearer ${client}`);
  assert.equal(account.status, 200);
  assert.equal(account.body.profile.email, 'client@coldcreekfarm.com');
  assert.ok(account.body.profile.name);

  const forbidden = await request(app)
    .get('/api/client/notifications')
    .set('Authorization', `Bearer ${admin}`);
  assert.equal(forbidden.status, 403);

  await query('UPDATE bookings SET client_id = NULL WHERE client_id = $1', [clientId]);
  const createRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: `Notice Couple ${Date.now()}`,
      eventName: `Notice Event ${Date.now()}`,
      eventDate: '2027-08-14',
      eventStartTime: '15:00',
      eventEndTime: '22:00',
      guests: 80,
      bookingStatus: 'Pending',
      clientId,
    });
  assert.equal(createRes.status, 201);
  const bookingId = createRes.body.booking.id;

  const list = await request(app)
    .get('/api/client/notifications')
    .set('Authorization', `Bearer ${client}`);
  assert.equal(list.status, 200);
  const created = list.body.notifications.find(
    (item) => item.bookingId === bookingId && item.type === 'Booking assigned',
  );
  assert.ok(created);
  assert.equal(created.status, 'Unread');
  assert.ok(list.body.unreadCount >= 1);

  const marked = await request(app)
    .patch(`/api/client/notifications/${created.id}/read`)
    .set('Authorization', `Bearer ${client}`);
  assert.equal(marked.status, 200);
  assert.equal(marked.body.notification.status, 'Read');

  const other = await request(app)
    .patch(`/api/client/notifications/${created.id}/read`)
    .set('Authorization', `Bearer ${admin}`);
  assert.equal(other.status, 403);

  await request(app)
    .delete(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${admin}`);
});
});

test.after(async () => {
  await pool.end();
});
