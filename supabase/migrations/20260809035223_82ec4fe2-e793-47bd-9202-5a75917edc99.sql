ALTER TABLE public.con_clients
  ADD COLUMN IF NOT EXISTS property_photo_url text,
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS work_address text,
  ADD COLUMN IF NOT EXISTS preferred_contact text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS urgency text,
  ADD COLUMN IF NOT EXISTS wants text,
  ADD COLUMN IF NOT EXISTS client_since date,
  ADD COLUMN IF NOT EXISTS lifetime_value numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';