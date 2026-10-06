import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendRoot, '.env'), quiet: true });

const useSsl = process.env.DB_SSL === 'true';

function resolvePortalUrl() {
  const explicit = String(process.env.PORTAL_URL || '').trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const productionHost = String(process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim();
  if (productionHost) {
    return `https://${productionHost}`.replace(/\/$/, '');
  }

  const deploymentHost = String(process.env.VERCEL_URL || '').trim();
  if (deploymentHost) {
    return `https://${deploymentHost}`.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT) || 3000,
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'cold_creek_farm_portal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: useSsl,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    rememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '30d',
  },
  portalUrl: resolvePortalUrl(),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    password: String(process.env.SMTP_PASSWORD || '').replace(/\s+/g, ''),
    secure: process.env.SMTP_SECURE === 'true',
    from: String(process.env.SMTP_FROM || process.env.SMTP_USER || '')
      .replace(/^["']|["']$/g, '')
      .trim(),
    ownerEmail: (process.env.SMTP_OWNER_EMAIL || '').trim().toLowerCase(),
    replyTo: (process.env.SMTP_REPLY_TO || process.env.SMTP_OWNER_EMAIL || '').trim(),
  },
  notifyVendors: process.env.NOTIFY_VENDORS === 'true',
  vendorTestEmail: (process.env.VENDOR_TEST_EMAIL || '').trim().toLowerCase(),
};
