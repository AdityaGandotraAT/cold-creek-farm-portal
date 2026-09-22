DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('Confirmed', 'Pending');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_selection_status') THEN
    CREATE TYPE vendor_selection_status AS ENUM ('Confirmed', 'Pending', 'Not Selected');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_start_time TIME NOT NULL,
  event_end_time TIME NOT NULL,
  venue TEXT NOT NULL DEFAULT 'Cold Creek Farm',
  guests INTEGER NOT NULL CHECK (guests >= 1),
  booking_status booking_status NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT bookings_reference_not_blank CHECK (length(trim(reference_number)) > 0),
  CONSTRAINT bookings_venue_not_blank CHECK (length(trim(venue)) > 0),
  CONSTRAINT bookings_time_order CHECK (event_end_time > event_start_time)
);

CREATE INDEX IF NOT EXISTS bookings_event_date_idx ON bookings (event_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (booking_status);

DROP TRIGGER IF EXISTS bookings_set_updated_at ON bookings;
CREATE TRIGGER bookings_set_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS booking_vendor_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  vendor_name TEXT,
  selection_status vendor_selection_status NOT NULL DEFAULT 'Not Selected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT booking_vendor_selections_category_not_blank CHECK (length(trim(category)) > 0),
  CONSTRAINT booking_vendor_selections_unique_category UNIQUE (booking_id, category)
);

DROP TRIGGER IF EXISTS booking_vendor_selections_set_updated_at ON booking_vendor_selections;
CREATE TRIGGER booking_vendor_selections_set_updated_at
BEFORE UPDATE ON booking_vendor_selections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
