ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS portal_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  vendor_lock_days INTEGER NOT NULL DEFAULT 90,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  client_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  vendor_notifications BOOLEAN NOT NULL DEFAULT FALSE,
  session_timeout TEXT NOT NULL DEFAULT '30 minutes',
  login_security BOOLEAN NOT NULL DEFAULT TRUE,
  client_portal_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  welcome_email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT portal_settings_lock_days_valid CHECK (vendor_lock_days >= 1 AND vendor_lock_days <= 365),
  CONSTRAINT portal_settings_timeout_valid CHECK (
    session_timeout IN ('15 minutes', '30 minutes', '1 hour', '4 hours')
  )
);

INSERT INTO portal_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS portal_settings_set_updated_at ON portal_settings;
CREATE TRIGGER portal_settings_set_updated_at
BEFORE UPDATE ON portal_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
