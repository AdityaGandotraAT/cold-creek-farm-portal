import { checkDatabaseConnection } from '../services/dbHealthService.js';

export function getHealth(_req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
  });
}

export async function getDbHealth(_req, res) {
  try {
    const now = await checkDatabaseConnection();

    res.status(200).json({
      status: 'ok',
      message: 'Database connection successful',
      now,
    });
  } catch (err) {
    console.error('Database health check failed:', err.message);

    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message,
    });
  }
}
