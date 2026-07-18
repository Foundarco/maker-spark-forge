ALTER TABLE public.hq_emails ADD COLUMN IF NOT EXISTS message_id text, ADD COLUMN IF NOT EXISTS in_reply_to text, ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'outbound';
CREATE INDEX IF NOT EXISTS hq_emails_message_id_idx ON public.hq_emails(message_id);
CREATE INDEX IF NOT EXISTS hq_emails_to_addr_idx ON public.hq_emails(to_addr);