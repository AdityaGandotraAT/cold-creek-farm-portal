import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';
import { defaultPortalSettings } from '../src/utils/settingsMapper.js';
import { updatePortalSettings } from '../src/services/settingsService.js';

async function adminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@coldcreekfarm.com', password: 'CcfAdmin123!' });
  assert.equal(res.status, 200);
  return res.body.token;
}

async function restoreSettings() {
  await updatePortalSettings(defaultPortalSettings());
}

describe('admin settings', () => {
  test.afterEach(async () => {
    await restoreSettings();
  });

  test('admin can load and save portal settings', async () => {
    const token = await adminToken();
    const loaded = await request(app).get('/api/settings').set('Authorization', `Bearer ${token}`);
    assert.equal(loaded.status, 200);
    assert.equal(loaded.body.settings.welcomeEmailEnabled, true);

    const saved = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...loaded.body.settings,
        vendorLockDays: 60,
        sessionTimeout: '15 minutes',
        welcomeEmailEnabled: false,
      });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.settings.vendorLockDays, 60);
    assert.equal(saved.body.settings.sessionTimeout, '15 minutes');
    assert.equal(saved.body.settings.welcomeEmailEnabled, false);
  });

  test('clients cannot change settings', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client@coldcreekfarm.com', password: 'CcfClient123!' });
    assert.equal(login.status, 200);

    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ maintenanceMode: true });
    assert.equal(res.status, 403);
  });

  test('maintenance mode blocks client login but not admin', async () => {
    const token = await adminToken();
    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ maintenanceMode: true, clientPortalEnabled: true });

    const client = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client@coldcreekfarm.com', password: 'CcfClient123!' });
    assert.equal(client.status, 503);

    const admin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@coldcreekfarm.com', password: 'CcfAdmin123!' });
    assert.equal(admin.status, 200);
  });

  test('disabled client portal blocks client login', async () => {
    const token = await adminToken();
    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ clientPortalEnabled: false, maintenanceMode: false });

    const client = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client@coldcreekfarm.com', password: 'CcfClient123!' });
    assert.equal(client.status, 403);
  });

  test('admin can update profile name and phone', async () => {
    const token = await adminToken();
    const saved = await request(app)
      .put('/api/settings/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        adminName: 'CCF Admin',
        profileEmail: 'admin@coldcreekfarm.com',
        profilePhone: '(706) 216-2013',
      });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.user.phone, '(706) 216-2013');
    assert.equal(saved.body.user.email, 'admin@coldcreekfarm.com');
  });
});

test.after(async () => {
  await restoreSettings();
  await pool.end();
});
