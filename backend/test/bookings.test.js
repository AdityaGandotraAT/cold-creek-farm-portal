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

const sampleBooking = {
  name: `Test Couple ${Date.now()}`,
  eventName: `Test Event ${Date.now()}`,
  eventDate: '2026-09-20',
  eventStartTime: '16:00',
  eventEndTime: '22:00',
  guests: 120,
  bookingStatus: 'Pending',
};

test('admin can create, read, update, and delete bookings', async () => {
  const token = await adminToken();

  const createRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send(sampleBooking);

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.status, 'ok');
  assert.ok(createRes.body.booking.id);
  assert.equal(createRes.body.booking.venue, 'Cold Creek Farm');
  assert.match(createRes.body.booking.referenceNumber, /^CCF-\d{4}-\d+$/);

  const bookingId = createRes.body.booking.id;

  const getRes = await request(app)
    .get(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.booking.name, sampleBooking.name);
  assert.equal(getRes.body.booking.eventName, sampleBooking.eventName);

  const selectionsRes = await request(app)
    .get(`/api/bookings/${bookingId}/vendor-selections`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(selectionsRes.status, 200);
  assert.equal(selectionsRes.body.selections.length, 6);

  const listRes = await request(app)
    .get('/api/bookings')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.bookings.some((booking) => booking.id === bookingId));

  const updateRes = await request(app)
    .put(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...sampleBooking, bookingStatus: 'Confirmed', guests: 140 });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.booking.bookingStatus, 'Confirmed');
  assert.equal(updateRes.body.booking.guests, 140);
  assert.equal(updateRes.body.booking.venue, 'Cold Creek Farm');

  const deleteRes = await request(app)
    .delete(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(deleteRes.status, 200);

  const missingRes = await request(app)
    .get(`/api/bookings/${bookingId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(missingRes.status, 404);
});

test('bookings routes require admin auth', async () => {
  const missing = await request(app).get('/api/bookings');
  assert.equal(missing.status, 401);

  const clientLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'client@coldcreekfarm.com', password: 'CcfClient123!' });

  const forbidden = await request(app)
    .get('/api/bookings')
    .set('Authorization', `Bearer ${clientLogin.body.token}`);

  assert.equal(forbidden.status, 403);
});

test.after(async () => {
  await pool.end();
});
