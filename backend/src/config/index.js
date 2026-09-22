import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendRoot, '.env'), quiet: true });

const useSsl = process.env.DB_SSL === 'true';

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
  portalUrl: (process.env.PORTAL_URL || 'http://localhost:3000').replace(/\/$/, ''),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    secure: process.env.SMTP_SECURE === 'true',
    from: String(process.env.SMTP_FROM || process.env.SMTP_USER || '')
      .replace(/^["']|["']$/g, '')
      .trim(),
    ownerEmail: (process.env.SMTP_OWNER_EMAIL || '').trim().toLowerCase(),
    replyTo: (process.env.SMTP_REPLY_TO || process.env.SMTP_OWNER_EMAIL || '').trim(),
  },
};
