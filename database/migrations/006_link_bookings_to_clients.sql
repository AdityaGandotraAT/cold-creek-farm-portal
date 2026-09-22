-- Each portal client can have one booking. Event type and notes are shown on My Booking.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS event_type TEXT;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_one_per_client_idx
  ON bookings (client_id)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS bookings_client_id_idx
  ON bookings (client_id);
