-- Portal login accounts stay on users. Clients link to a CLIENT user.
-- Username for login is the email address (existing auth convention).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients (user_id);
