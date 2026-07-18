
CREATE TABLE IF NOT EXISTS public.hq_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text,
  event_type text NOT NULL,
  recipient text,
  subject text,
  payload jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hq_email_events_msg_idx ON public.hq_email_events(message_id);
CREATE INDEX IF NOT EXISTS hq_email_events_type_idx ON public.hq_email_events(event_type);

GRANT SELECT ON public.hq_email_events TO authenticated;
GRANT ALL ON public.hq_email_events TO service_role;

ALTER TABLE public.hq_email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view email events"
  ON public.hq_email_events FOR SELECT
  TO authenticated USING (true);

ALTER TABLE public.hq_emails
  ADD COLUMN IF NOT EXISTS last_event text,
  ADD COLUMN IF NOT EXISTS last_event_at timestamptz,
  ADD COLUMN IF NOT EXISTS opens_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS bounced_at timestamptz,
  ADD COLUMN IF NOT EXISTS complained_at timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
