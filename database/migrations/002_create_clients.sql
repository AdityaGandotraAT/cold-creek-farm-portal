CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  birth_date DATE,
  primary_phone TEXT NOT NULL,
  secondary_phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  facebook_url TEXT,
  twitter_url TEXT,
  google_plus_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT clients_email_not_blank CHECK (length(trim(email)) > 0),
  CONSTRAINT clients_reference_not_blank CHECK (length(trim(reference_number)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS clients_email_lower_idx ON clients (LOWER(email));

DROP TRIGGER IF EXISTS clients_set_updated_at ON clients;
CREATE TRIGGER clients_set_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
