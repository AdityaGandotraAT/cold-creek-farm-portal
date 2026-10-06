import { getPortalSettings, updatePortalSettings } from '../services/settingsService.js';
import { updateAdminProfile } from '../services/authService.js';
import { publicPortalSettings } from '../utils/settingsMapper.js';

export async function getPublicSettings(_req, res, next) {
  try {
    const settings = await getPortalSettings();
    res.status(200).json({ status: 'ok', settings: publicPortalSettings(settings) });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(_req, res, next) {
  try {
    const settings = await getPortalSettings({ fresh: true });
    res.status(200).json({ status: 'ok', settings });
  } catch (err) {
    next(err);
  }
}

export async function putSettings(req, res, next) {
  try {
    const settings = await updatePortalSettings(req.body || {});
    res.status(200).json({ status: 'ok', message: 'Settings saved', settings });
  } catch (err) {
    next(err);
  }
}

export async function putProfile(req, res, next) {
  try {
    const user = await updateAdminProfile(req.user.id, req.body || {});
    res.status(200).json({ status: 'ok', message: 'Profile saved', user });
  } catch (err) {
    next(err);
  }
}
