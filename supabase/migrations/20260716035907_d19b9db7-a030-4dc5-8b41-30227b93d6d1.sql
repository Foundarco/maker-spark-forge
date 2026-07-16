
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM (
  'super_admin', 'admin', 'manager', 'employee',
  'engineering', 'manufacturing', 'sales', 'finance',
  'hr', 'it', 'support', 'marketing'
);

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  department TEXT,
  title TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_hq_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;

-- ============ INVITES ============
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'employee',
  department TEXT,
  full_name TEXT,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.invites (lower(email));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invites TO authenticated;
GRANT ALL ON public.invites TO service_role;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.notifications (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============ ANNOUNCEMENTS ============
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============ ACTIVITY_LOG ============
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.activity_log (created_at DESC);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============

-- profiles: all authenticated can read; user updates own; admins update any
CREATE POLICY "profiles read for authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles user updates own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles admin updates any" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_hq_admin(auth.uid())) WITH CHECK (public.is_hq_admin(auth.uid()));
CREATE POLICY "profiles admin delete" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_hq_admin(auth.uid()));
-- inserts happen via trigger only; no INSERT policy needed for users

-- user_roles: users read own; admins read all; admins insert/delete
CREATE POLICY "user_roles read own" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_hq_admin(auth.uid()));

-- invites: admin only
CREATE POLICY "invites admin all" ON public.invites
  FOR ALL TO authenticated
  USING (public.is_hq_admin(auth.uid()))
  WITH CHECK (public.is_hq_admin(auth.uid()));

-- notifications: user sees own
CREATE POLICY "notifications user own" ON public.notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- announcements: all authenticated read; admins write
CREATE POLICY "announcements read" ON public.announcements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements admin write" ON public.announcements
  FOR INSERT TO authenticated WITH CHECK (public.is_hq_admin(auth.uid()));
CREATE POLICY "announcements admin update" ON public.announcements
  FOR UPDATE TO authenticated USING (public.is_hq_admin(auth.uid())) WITH CHECK (public.is_hq_admin(auth.uid()));
CREATE POLICY "announcements admin delete" ON public.announcements
  FOR DELETE TO authenticated USING (public.is_hq_admin(auth.uid()));

-- activity_log: all authenticated read; anyone signed in can insert own
CREATE POLICY "activity read" ON public.activity_log
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity insert own" ON public.activity_log
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- ============ TRIGGERS ============

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- On new auth user: require valid invite, create profile, assign role
CREATE OR REPLACE FUNCTION public.handle_new_hq_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_is_first BOOLEAN;
BEGIN
  -- Is this the very first user? If so, allow and grant super_admin.
  SELECT NOT EXISTS(SELECT 1 FROM public.profiles) INTO v_is_first;

  IF v_is_first THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
    RETURN NEW;
  END IF;

  -- Otherwise require a valid unexpired invite
  SELECT * INTO v_invite
  FROM public.invites
  WHERE lower(email) = lower(NEW.email)
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup not allowed: no active invite for %', NEW.email
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, department)
  VALUES (NEW.id, NEW.email, COALESCE(v_invite.full_name, NEW.email), v_invite.department);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_invite.role)
  ON CONFLICT DO NOTHING;

  -- Also grant baseline employee role
  IF v_invite.role <> 'employee' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee') ON CONFLICT DO NOTHING;
  END IF;

  UPDATE public.invites SET accepted_at = now() WHERE id = v_invite.id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_hq
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_hq_user();
