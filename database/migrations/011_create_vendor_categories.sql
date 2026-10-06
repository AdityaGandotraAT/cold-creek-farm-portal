CREATE TABLE IF NOT EXISTS vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vendor_categories_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT vendor_categories_status_valid CHECK (status IN ('Active', 'Inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS vendor_categories_name_lower_idx
  ON vendor_categories (lower(name));

CREATE INDEX IF NOT EXISTS vendor_categories_status_idx ON vendor_categories (status);
CREATE INDEX IF NOT EXISTS vendor_categories_sort_idx ON vendor_categories (sort_order, name);

DROP TRIGGER IF EXISTS vendor_categories_set_updated_at ON vendor_categories;
CREATE TRIGGER vendor_categories_set_updated_at
BEFORE UPDATE ON vendor_categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO vendor_categories (name, status, required, sort_order)
SELECT v.name, v.status, v.required, v.sort_order
FROM (
  VALUES
    ('Videographers', 'Active', FALSE, 1),
    ('Photographers', 'Active', TRUE, 2),
    ('Photo Booths', 'Active', FALSE, 3),
    ('Wedding Coordinators', 'Active', FALSE, 4),
    ('Catering', 'Active', TRUE, 5),
    ('DJs', 'Active', TRUE, 6),
    ('Wedding Officiants', 'Active', TRUE, 7),
    ('Florist', 'Active', TRUE, 8),
    ('Bakers', 'Active', FALSE, 9),
    ('Rentals', 'Active', TRUE, 10),
    ('Cartoonist', 'Active', FALSE, 11),
    ('Invitations, Save the Dates, Etc', 'Active', FALSE, 12),
    ('Treats', 'Active', FALSE, 13),
    ('Hair & Make Up', 'Active', FALSE, 14),
    ('Additional Add-On Vendors', 'Active', FALSE, 15),
    ('Musicians', 'Active', FALSE, 16),
    ('Sparklers, Marquee Letters, Neon Signs, Uplighting, Indoor Cold Sparks', 'Active', FALSE, 17),
    ('Carriage Services', 'Active', FALSE, 18)
) AS v(name, status, required, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM vendor_categories c WHERE lower(c.name) = lower(v.name)
);

INSERT INTO vendor_categories (name, status, required, sort_order)
SELECT DISTINCT v.category, 'Active', FALSE, 200
FROM vendors v
WHERE v.category IS NOT NULL
  AND length(trim(v.category)) > 0
  AND NOT EXISTS (
    SELECT 1 FROM vendor_categories c WHERE lower(c.name) = lower(v.category)
  );
