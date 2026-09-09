import { HttpError } from '../utils/httpError.js';

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const isTrusted = err instanceof HttpError || Boolean(err.status);

  if (!isTrusted) {
    console.error(err);
  }

  res.status(status).json({
    status: 'error',
    message: isTrusted ? err.message : 'Internal server error',
  });
}
