
-- Edited markers
ALTER TABLE public.channel_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- Message reactions (channel + dm)
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type text NOT NULL CHECK (message_type IN ('channel','dm')),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_type, message_id, user_id, emoji)
);
CREATE INDEX IF NOT EXISTS message_reactions_msg_idx ON public.message_reactions(message_type, message_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_reactions TO authenticated;
GRANT ALL ON public.message_reactions TO service_role;

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read reactions"
  ON public.message_reactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users manage own reactions"
  ON public.message_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own reactions"
  ON public.message_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- External meeting invites
CREATE TABLE IF NOT EXISTS public.meeting_external_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS meeting_external_invites_mid_idx ON public.meeting_external_invites(meeting_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_external_invites TO authenticated;
GRANT SELECT, UPDATE ON public.meeting_external_invites TO anon;
GRANT ALL ON public.meeting_external_invites TO service_role;

ALTER TABLE public.meeting_external_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Host reads own invites"
  ON public.meeting_external_invites FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.meetings m WHERE m.id = meeting_id AND m.host_id = auth.uid())
         OR invited_by = auth.uid());

CREATE POLICY "Host creates invites"
  ON public.meeting_external_invites FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.meetings m WHERE m.id = meeting_id AND m.host_id = auth.uid()));

CREATE POLICY "Host deletes invites"
  ON public.meeting_external_invites FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.meetings m WHERE m.id = meeting_id AND m.host_id = auth.uid()));

CREATE POLICY "Public lookup by token"
  ON public.meeting_external_invites FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon mark joined"
  ON public.meeting_external_invites FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- Link calendar events to meetings
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS meeting_id uuid REFERENCES public.meetings(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS calendar_events_meeting_idx ON public.calendar_events(meeting_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_external_invites;
