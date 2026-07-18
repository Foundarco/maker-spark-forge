
-- ============================================================
-- Drive (Google Drive–style file system)
-- ============================================================
CREATE TABLE public.drive_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.drive_items(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('folder','file')),
  name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT DEFAULT 0,
  storage_path TEXT, -- key in the 'drive' bucket, null for folders
  starred BOOLEAN NOT NULL DEFAULT false,
  trashed_at TIMESTAMPTZ,
  color TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX drive_items_owner_idx ON public.drive_items(owner_id);
CREATE INDEX drive_items_parent_idx ON public.drive_items(parent_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drive_items TO authenticated;
GRANT ALL ON public.drive_items TO service_role;

ALTER TABLE public.drive_items ENABLE ROW LEVEL SECURITY;

-- Shares
CREATE TABLE public.drive_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.drive_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view','comment','edit')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR role_id IS NOT NULL)
);
CREATE INDEX drive_shares_item_idx ON public.drive_shares(item_id);
CREATE INDEX drive_shares_user_idx ON public.drive_shares(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drive_shares TO authenticated;
GRANT ALL ON public.drive_shares TO service_role;

ALTER TABLE public.drive_shares ENABLE ROW LEVEL SECURITY;

-- Security definer: does the user have access (owner, shared directly, or via role)?
CREATE OR REPLACE FUNCTION public.drive_has_access(_item_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.drive_items WHERE id = _item_id AND owner_id = _user_id
  ) OR EXISTS(
    SELECT 1 FROM public.drive_shares s
    LEFT JOIN public.user_custom_roles ucr ON ucr.role_id = s.role_id AND ucr.user_id = _user_id
    WHERE s.item_id = _item_id
      AND (s.user_id = _user_id OR ucr.user_id = _user_id)
  ) OR EXISTS(
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin')
  );
$$;

-- RLS policies
CREATE POLICY "drive_items owner all" ON public.drive_items
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.drive_has_access(id, auth.uid()))
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "drive_shares readable by involved" ON public.drive_shares
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS(SELECT 1 FROM public.drive_items i WHERE i.id = item_id AND i.owner_id = auth.uid())
    OR EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','admin'))
  );

CREATE POLICY "drive_shares owner writes" ON public.drive_shares
  FOR ALL TO authenticated
  USING (EXISTS(SELECT 1 FROM public.drive_items i WHERE i.id = item_id AND i.owner_id = auth.uid()))
  WITH CHECK (EXISTS(SELECT 1 FROM public.drive_items i WHERE i.id = item_id AND i.owner_id = auth.uid()));

CREATE TRIGGER drive_items_updated_at BEFORE UPDATE ON public.drive_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Email settings (per-user + company)
-- ============================================================
CREATE TABLE public.user_email_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  signature TEXT,
  auto_reply_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_reply_subject TEXT,
  auto_reply_body TEXT,
  notify_on_new BOOLEAN NOT NULL DEFAULT true,
  notify_on_mention BOOLEAN NOT NULL DEFAULT true,
  digest_frequency TEXT NOT NULL DEFAULT 'off' CHECK (digest_frequency IN ('off','daily','weekly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_email_settings TO authenticated;
GRANT ALL ON public.user_email_settings TO service_role;
ALTER TABLE public.user_email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_email_settings self" ON public.user_email_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER user_email_settings_updated_at BEFORE UPDATE ON public.user_email_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Company email settings (single row keyed by id='default')
CREATE TABLE public.company_email_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  sender_domain TEXT,
  from_name TEXT,
  reply_to TEXT,
  default_footer TEXT,
  track_opens BOOLEAN NOT NULL DEFAULT true,
  track_clicks BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
GRANT SELECT ON public.company_email_settings TO authenticated;
GRANT ALL ON public.company_email_settings TO service_role;
ALTER TABLE public.company_email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_email read all authed" ON public.company_email_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "company_email admin writes" ON public.company_email_settings
  FOR ALL TO authenticated
  USING (public.has_role_permission(auth.uid(), 'admin'))
  WITH CHECK (public.has_role_permission(auth.uid(), 'admin'));

CREATE TRIGGER company_email_settings_updated_at BEFORE UPDATE ON public.company_email_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.company_email_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- ============================================================
-- Mentions in channel messages -> notifications
-- Column already exists on channel_messages? Add mentions[] jsonb for tracking
-- ============================================================
ALTER TABLE public.channel_messages ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT '{}';
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT '{}';

-- Trigger: on channel_messages insert, create notification for each mentioned user
CREATE OR REPLACE FUNCTION public.notify_channel_mentions()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID;
  v_author_name TEXT;
  v_channel_name TEXT;
BEGIN
  IF NEW.mentions IS NULL OR array_length(NEW.mentions, 1) IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT full_name INTO v_author_name FROM public.profiles WHERE id = NEW.author_id;
  SELECT name INTO v_channel_name FROM public.channels WHERE id = NEW.channel_id;
  FOREACH v_uid IN ARRAY NEW.mentions LOOP
    IF v_uid <> NEW.author_id THEN
      INSERT INTO public.notifications (user_id, title, body, link)
      VALUES (
        v_uid,
        COALESCE(v_author_name,'Someone') || ' mentioned you in #' || COALESCE(v_channel_name,'a channel'),
        LEFT(COALESCE(NEW.body,''), 200),
        '/channels?c=' || NEW.channel_id::text
      );
    END IF;
  END LOOP;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_channel_mentions ON public.channel_messages;
CREATE TRIGGER trg_channel_mentions AFTER INSERT ON public.channel_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_channel_mentions();

-- Trigger: on direct_messages insert, notify recipient (in case they don't have realtime open)
CREATE OR REPLACE FUNCTION public.notify_dm_recipient()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  IF NEW.recipient_id IS NULL OR NEW.recipient_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;
  SELECT full_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;
  INSERT INTO public.notifications (user_id, title, body, link)
  VALUES (
    NEW.recipient_id,
    'New message from ' || COALESCE(v_sender_name,'someone'),
    LEFT(COALESCE(NEW.body,''), 200),
    '/dm?user=' || NEW.sender_id::text
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_dm_notify ON public.direct_messages;
CREATE TRIGGER trg_dm_notify AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_dm_recipient();
