import { HttpError } from '../utils/httpError.js';

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Invalid or missing token'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'Forbidden'));
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireClient = requireRole('CLIENT');
