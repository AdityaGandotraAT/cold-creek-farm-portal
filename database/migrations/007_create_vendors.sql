CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vendors_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT vendors_category_not_blank CHECK (length(trim(category)) > 0),
  CONSTRAINT vendors_status_valid CHECK (status IN ('Active', 'Inactive')),
  CONSTRAINT vendors_category_name_unique UNIQUE (category, name)
);

CREATE INDEX IF NOT EXISTS vendors_category_idx ON vendors (category);
CREATE INDEX IF NOT EXISTS vendors_status_idx ON vendors (status);

DROP TRIGGER IF EXISTS vendors_set_updated_at ON vendors;
CREATE TRIGGER vendors_set_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
