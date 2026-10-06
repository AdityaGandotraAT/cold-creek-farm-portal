DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'vendor_selection_status'
      AND e.enumlabel = 'Unavailable'
  ) THEN
    ALTER TYPE vendor_selection_status ADD VALUE 'Unavailable';
  END IF;
END
$$;
