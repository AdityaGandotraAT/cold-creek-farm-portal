import app from '../backend/src/app.js';

export default function handler(req, res) {
  const originalUrl = req.url || '/';

  if (!originalUrl.startsWith('/api')) {
    req.url = originalUrl === '/' ? '/api' : `/api${originalUrl}`;
  }

  return app(req, res);
}
