CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience TEXT NOT NULL DEFAULT 'ADMIN',
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  related_name TEXT NOT NULL DEFAULT '',
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notifications_audience_valid CHECK (audience IN ('ADMIN', 'CLIENT')),
  CONSTRAINT notifications_status_valid CHECK (status IN ('Unread', 'Read')),
  CONSTRAINT notifications_type_not_blank CHECK (length(trim(type)) > 0),
  CONSTRAINT notifications_title_not_blank CHECK (length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS notifications_audience_created_idx
  ON notifications (audience, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_audience_status_idx
  ON notifications (audience, status);

INSERT INTO notifications (
  audience,
  type,
  title,
  detail,
  related_name,
  booking_id,
  client_id,
  status
)
SELECT
  'ADMIN',
  'Vendor selected',
  trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')) || ' selected ' || s.vendor_name,
  trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, ''))
    || ' chose '
    || s.vendor_name
    || ' for '
    || s.category
    || ' on '
    || coalesce(b.event_name, b.name)
    || ' ('
    || b.reference_number
    || ').',
  s.vendor_name,
  b.id,
  b.client_id,
  'Unread'
FROM booking_vendor_selections s
JOIN bookings b ON b.id = s.booking_id
JOIN clients c ON c.id = b.client_id
WHERE s.vendor_name IS NOT NULL
  AND length(trim(s.vendor_name)) > 0
  AND s.selection_status <> 'Not Selected'
  AND NOT EXISTS (
    SELECT 1
    FROM notifications n
    WHERE n.booking_id = s.booking_id
      AND n.type = 'Vendor selected'
      AND n.related_name = s.vendor_name
      AND n.detail LIKE '%' || s.category || '%'
  );
