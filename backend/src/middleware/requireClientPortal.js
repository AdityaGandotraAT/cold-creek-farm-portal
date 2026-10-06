import { getPortalSettings } from '../services/settingsService.js';
import { HttpError } from '../utils/httpError.js';

export async function requireClientPortal(req, _res, next) {
  try {
    const settings = await getPortalSettings();
    if (settings.maintenanceMode) {
      next(new HttpError(503, 'The portal is under maintenance. Please try again later.'));
      return;
    }
    if (!settings.clientPortalEnabled) {
      next(new HttpError(403, 'The client portal is currently disabled'));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
