
-- Create all tables first
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.channel_members (
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE public.channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  join_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_participants (
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rsvp TEXT NOT NULL DEFAULT 'pending',
  PRIMARY KEY (meeting_id, user_id)
);

CREATE TABLE public.meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_date TIMESTAMPTZ,
  tags TEXT[] NOT NULL DEFAULT '{}',
  attendees TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  color TEXT NOT NULL DEFAULT 'orange',
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.channels, public.channel_members, public.channel_messages, public.direct_messages, public.meetings, public.meeting_participants, public.meeting_notes, public.calendar_events TO service_role;

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policies (all tables exist now, cross-references are safe)
CREATE POLICY "channels_select" ON public.channels FOR SELECT TO authenticated USING (
  NOT is_private
  OR created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.channel_members m WHERE m.channel_id = id AND m.user_id = auth.uid())
);
CREATE POLICY "channels_insert" ON public.channels FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "channels_update_owner" ON public.channels FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "channels_delete_owner" ON public.channels FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "cm_select" ON public.channel_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "cm_insert_self" ON public.channel_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "cm_delete_self" ON public.channel_members FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "chm_select" ON public.channel_messages FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.channels c WHERE c.id = channel_id AND (
      NOT c.is_private
      OR c.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM public.channel_members m WHERE m.channel_id = c.id AND m.user_id = auth.uid())
    )
  )
);
CREATE POLICY "chm_insert" ON public.channel_messages FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "chm_delete_author" ON public.channel_messages FOR DELETE TO authenticated USING (author_id = auth.uid());

CREATE POLICY "dm_select" ON public.direct_messages FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "dm_insert" ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "dm_update_recipient" ON public.direct_messages FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "m_select" ON public.meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "m_insert" ON public.meetings FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "m_update_host" ON public.meetings FOR UPDATE TO authenticated USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());
CREATE POLICY "m_delete_host" ON public.meetings FOR DELETE TO authenticated USING (host_id = auth.uid());

CREATE POLICY "mp_select" ON public.meeting_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "mp_insert" ON public.meeting_participants FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.meetings mt WHERE mt.id = meeting_id AND mt.host_id = auth.uid())
);
CREATE POLICY "mp_update_self" ON public.meeting_participants FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "mp_delete_self_or_host" ON public.meeting_participants FOR DELETE TO authenticated USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.meetings mt WHERE mt.id = meeting_id AND mt.host_id = auth.uid())
);

CREATE POLICY "mn_select" ON public.meeting_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "mn_insert" ON public.meeting_notes FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "mn_update_author" ON public.meeting_notes FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "mn_delete_author" ON public.meeting_notes FOR DELETE TO authenticated USING (author_id = auth.uid());

CREATE POLICY "ce_select" ON public.calendar_events FOR SELECT TO authenticated USING (owner_id = auth.uid() OR visibility = 'team');
CREATE POLICY "ce_insert" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ce_update_owner" ON public.calendar_events FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ce_delete_owner" ON public.calendar_events FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Triggers
CREATE TRIGGER channels_updated BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER meetings_updated BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER mn_updated BEFORE UPDATE ON public.meeting_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ce_updated BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX chm_channel_idx ON public.channel_messages(channel_id, created_at DESC);
CREATE INDEX dm_pair_idx ON public.direct_messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX meetings_starts_idx ON public.meetings(starts_at DESC);
CREATE INDEX ce_starts_idx ON public.calendar_events(starts_at);
