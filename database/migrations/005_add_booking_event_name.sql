-- Event name identifies which event the booking is for (separate from couple/client name).

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS event_name TEXT;

UPDATE bookings
SET event_name = name
WHERE event_name IS NULL OR length(trim(event_name)) = 0;

ALTER TABLE bookings
  ALTER COLUMN event_name SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_event_name_not_blank'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_event_name_not_blank CHECK (length(trim(event_name)) > 0);
  END IF;
END
$$;
