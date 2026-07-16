
-- ============ CUSTOM ROLES ============
CREATE TABLE public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#94a3b8',
  position INTEGER NOT NULL DEFAULT 0,
  permissions JSONB NOT NULL DEFAULT '{"manage_channels":false,"manage_roles":false,"manage_messages":false,"admin":false}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_roles TO authenticated;
GRANT ALL ON public.custom_roles TO service_role;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_custom_roles TO authenticated;
GRANT ALL ON public.user_custom_roles TO service_role;
ALTER TABLE public.user_custom_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer helper: does user have a given permission via any assigned role?
CREATE OR REPLACE FUNCTION public.has_role_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_custom_roles ucr
    JOIN public.custom_roles cr ON cr.id = ucr.role_id
    WHERE ucr.user_id = _user_id
      AND (COALESCE((cr.permissions->>_permission)::boolean, false) = true
           OR COALESCE((cr.permissions->>'admin')::boolean, false) = true)
  ) OR EXISTS(
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin')
  );
$$;

-- RLS: custom_roles readable by all authenticated (needed for role list display);
-- only admins/manage_roles can write.
CREATE POLICY "Read roles - all authenticated" ON public.custom_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage roles - permitted" ON public.custom_roles FOR INSERT TO authenticated WITH CHECK (public.has_role_permission(auth.uid(),'manage_roles'));
CREATE POLICY "Update roles - permitted" ON public.custom_roles FOR UPDATE TO authenticated USING (public.has_role_permission(auth.uid(),'manage_roles')) WITH CHECK (public.has_role_permission(auth.uid(),'manage_roles'));
CREATE POLICY "Delete roles - permitted" ON public.custom_roles FOR DELETE TO authenticated USING (public.has_role_permission(auth.uid(),'manage_roles'));

CREATE POLICY "Read user_custom_roles - all authenticated" ON public.user_custom_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Assign user_custom_roles - permitted" ON public.user_custom_roles FOR INSERT TO authenticated WITH CHECK (public.has_role_permission(auth.uid(),'manage_roles'));
CREATE POLICY "Remove user_custom_roles - permitted" ON public.user_custom_roles FOR DELETE TO authenticated USING (public.has_role_permission(auth.uid(),'manage_roles'));

CREATE TRIGGER trg_custom_roles_updated_at BEFORE UPDATE ON public.custom_roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed a default admin role so the first super_admin can grant permissions.
INSERT INTO public.custom_roles (name, color, position, permissions)
VALUES ('Admin', '#f97316', 100, '{"manage_channels":true,"manage_roles":true,"manage_messages":true,"admin":true}'::jsonb);

-- ============ CHANNEL CATEGORIES ============
CREATE TABLE public.channel_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_categories TO authenticated;
GRANT ALL ON public.channel_categories TO service_role;
ALTER TABLE public.channel_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read categories" ON public.channel_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Create categories - permitted" ON public.channel_categories FOR INSERT TO authenticated WITH CHECK (public.has_role_permission(auth.uid(),'manage_channels'));
CREATE POLICY "Update categories - permitted" ON public.channel_categories FOR UPDATE TO authenticated USING (public.has_role_permission(auth.uid(),'manage_channels')) WITH CHECK (public.has_role_permission(auth.uid(),'manage_channels'));
CREATE POLICY "Delete categories - permitted" ON public.channel_categories FOR DELETE TO authenticated USING (public.has_role_permission(auth.uid(),'manage_channels'));

CREATE TRIGGER trg_channel_categories_updated_at BEFORE UPDATE ON public.channel_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ALTER CHANNELS ============
ALTER TABLE public.channels
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.channel_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- Grant manage_channels the ability to create/update/delete channels (in addition to existing).
DROP POLICY IF EXISTS "Members can create channels" ON public.channels;
CREATE POLICY "Create channels - permitted" ON public.channels FOR INSERT TO authenticated
  WITH CHECK (public.has_role_permission(auth.uid(),'manage_channels') AND created_by = auth.uid());

-- Channel role access (for private channels granted to entire roles)
CREATE TABLE public.channel_role_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, role_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_role_access TO authenticated;
GRANT ALL ON public.channel_role_access TO service_role;
ALTER TABLE public.channel_role_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read channel_role_access" ON public.channel_role_access FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage channel_role_access - permitted" ON public.channel_role_access FOR ALL TO authenticated
  USING (public.has_role_permission(auth.uid(),'manage_channels'))
  WITH CHECK (public.has_role_permission(auth.uid(),'manage_channels'));

-- ============ MESSAGE UPGRADES ============
ALTER TABLE public.channel_messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.channel_messages(id) ON DELETE SET NULL;

ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL;

-- Update policies: allow sender to update (edit) their own; allow manage_messages/admin to update/delete any.
DROP POLICY IF EXISTS "Authors can update own channel messages" ON public.channel_messages;
CREATE POLICY "Update own channel messages" ON public.channel_messages FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.has_role_permission(auth.uid(),'manage_messages'))
  WITH CHECK (author_id = auth.uid() OR public.has_role_permission(auth.uid(),'manage_messages'));

DROP POLICY IF EXISTS "Authors can update own direct messages" ON public.direct_messages;
CREATE POLICY "Update own direct messages" ON public.direct_messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- ============ MEETINGS ============
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.meeting_notes
  ADD COLUMN IF NOT EXISTS content_md TEXT;

-- ============ STORAGE POLICIES (message-attachments) ============
-- Authenticated users can upload to their own folder and read any object in the bucket.
CREATE POLICY "message-attachments upload by owner"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "message-attachments read authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'message-attachments');
CREATE POLICY "message-attachments delete own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
