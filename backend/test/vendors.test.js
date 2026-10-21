import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool, query } from '../src/config/database.js';

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

test('client catalog only includes the test vendor while the product is not live', async () => {
  const admin = await adminToken();
  const client = await clientToken();
  const hiddenName = `Hidden Vendor ${Date.now()}`;

  const hidden = await request(app)
    .post('/api/vendors')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: hiddenName,
      category: 'Photographers',
      email: `hidden.${Date.now()}@email.com`,
    });

  assert.equal(hidden.status, 201);

  const catalog = await request(app)
    .get('/api/client/vendor-selections')
    .set('Authorization', `Bearer ${client}`);

  assert.equal(catalog.status, 200);
  assert.ok(Array.isArray(catalog.body.vendors));
  assert.ok(catalog.body.vendors.some((vendor) => vendor.name === 'Aditya'));
  assert.ok(
    catalog.body.vendors.every(
      (vendor) => String(vendor.email || '').toLowerCase() === 'aditya@agreedtechnologies.com',
    ),
  );
  assert.ok(!catalog.body.vendors.some((vendor) => vendor.name === hiddenName));

  await query('DELETE FROM vendors WHERE id = $1', [hidden.body.vendor.id]);
});

test('admin can see the bookings aligned with a vendor', async () => {
  const admin = await adminToken();
  const vendorName = `Aligned Vendor ${Date.now()}`;
  const eventName = `Aligned Event ${Date.now()}`;

  const vendorRes = await request(app)
    .post('/api/vendors')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: vendorName,
      category: 'Florist',
      email: process.env.VENDOR_TEST_EMAIL || `aligned.${Date.now()}@email.com`,
    });
  assert.equal(vendorRes.status, 201);
  const vendorId = vendorRes.body.vendor.id;

  const bookingRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${admin}`)
    .send({
      name: 'Aligned Couple',
      eventName,
      eventDate: '2026-11-14',
      eventStartTime: '16:00',
      eventEndTime: '22:00',
      guests: 80,
      bookingStatus: 'Pending',
    });
  assert.equal(bookingRes.status, 201);
  const bookingId = bookingRes.body.booking.id;

  await query(
    `UPDATE booking_vendor_selections
     SET vendor_name = $2, selection_status = 'Pending'
     WHERE booking_id = $1 AND category = 'Florist'`,
    [bookingId, vendorName],
  );

  const aligned = await request(app)
    .get(`/api/vendors/${vendorId}/bookings`)
    .set('Authorization', `Bearer ${admin}`);

  assert.equal(aligned.status, 200);
  assert.equal(aligned.body.count, 1);
  assert.equal(aligned.body.bookings[0].eventName, eventName);
  assert.equal(aligned.body.bookings[0].clientName, 'Aligned Couple');
  assert.equal(aligned.body.bookings[0].category, 'Florist');
  assert.equal(aligned.body.bookings[0].selectionStatus, 'Pending');

  const list = await request(app).get('/api/vendors').set('Authorization', `Bearer ${admin}`);
  assert.equal(list.status, 200);
  const listed = list.body.vendors.find((vendor) => vendor.id === vendorId);
  assert.ok(listed, 'vendor is missing from the vendors list');
  assert.equal(listed.bookings.length, 1);
  assert.equal(listed.bookings[0].eventName, eventName);
  assert.equal(listed.bookings[0].clientName, 'Aligned Couple');

  await request(app).delete(`/api/bookings/${bookingId}`).set('Authorization', `Bearer ${admin}`);
  await query('DELETE FROM vendors WHERE id = $1', [vendorId]);
});

test.after(async () => {
  await pool.end();
});
