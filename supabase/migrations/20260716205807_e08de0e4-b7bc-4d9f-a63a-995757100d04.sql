
-- 1) Private schema for security-definer helpers so they're not exposed via PostgREST.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

-- Recreate is_hq_admin in private
CREATE OR REPLACE FUNCTION private.is_hq_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$fn$;

REVOKE ALL ON FUNCTION private.is_hq_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_hq_admin(uuid) TO authenticated;

-- Recreate has_role in private
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$fn$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

-- 2) Update all policies that reference public.is_hq_admin to use private.is_hq_admin
DROP POLICY IF EXISTS "announcements admin delete" ON public.announcements;
CREATE POLICY "announcements admin delete" ON public.announcements
  FOR DELETE TO authenticated USING (private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "announcements admin update" ON public.announcements;
CREATE POLICY "announcements admin update" ON public.announcements
  FOR UPDATE TO authenticated
  USING (private.is_hq_admin(auth.uid()))
  WITH CHECK (private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "announcements admin write" ON public.announcements;
CREATE POLICY "announcements admin write" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "idea_comments_delete_own_or_admin" ON public.idea_comments;
CREATE POLICY "idea_comments_delete_own_or_admin" ON public.idea_comments
  FOR DELETE TO authenticated
  USING ((auth.uid() = author_id) OR private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete ideas" ON public.ideas;
CREATE POLICY "Admins delete ideas" ON public.ideas
  FOR DELETE TO authenticated USING (private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage ideas" ON public.ideas;
CREATE POLICY "Admins manage ideas" ON public.ideas
  FOR UPDATE TO authenticated
  USING (private.is_hq_admin(auth.uid()))
  WITH CHECK (private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "invites admin all" ON public.invites;
CREATE POLICY "invites admin all" ON public.invites
  FOR ALL TO authenticated
  USING (private.is_hq_admin(auth.uid()))
  WITH CHECK (private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "profiles admin delete" ON public.profiles;
CREATE POLICY "profiles admin delete" ON public.profiles
  FOR DELETE TO authenticated USING (private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "profiles admin updates any" ON public.profiles;
CREATE POLICY "profiles admin updates any" ON public.profiles
  FOR UPDATE TO authenticated
  USING (private.is_hq_admin(auth.uid()))
  WITH CHECK (private.is_hq_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles read own" ON public.user_roles;
CREATE POLICY "user_roles read own" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.is_hq_admin(auth.uid()));

-- 3) Drop the public helpers now that no policies reference them
DROP FUNCTION IF EXISTS public.is_hq_admin(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 4) Lock down the trigger function — no direct execute from clients
REVOKE ALL ON FUNCTION public.handle_new_hq_user() FROM PUBLIC, anon, authenticated;

-- 5) profiles: replace read-all-authenticated with owner-or-admin
DROP POLICY IF EXISTS "profiles read for authenticated" ON public.profiles;
CREATE POLICY "profiles read own or admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR private.is_hq_admin(auth.uid()));

-- 6) Admin read policies on submission tables
CREATE POLICY "contact_submissions admin read" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (private.is_hq_admin(auth.uid()));

CREATE POLICY "interest_submissions admin read" ON public.interest_submissions
  FOR SELECT TO authenticated
  USING (private.is_hq_admin(auth.uid()));

CREATE POLICY "newsletter_signups admin read" ON public.newsletter_signups
  FOR SELECT TO authenticated
  USING (private.is_hq_admin(auth.uid()));

CREATE POLICY "orders admin read" ON public.orders
  FOR SELECT TO authenticated
  USING (private.is_hq_admin(auth.uid()));

-- 7) Tighten the always-true anon UPDATE on meeting_external_invites
DROP POLICY IF EXISTS "Anon mark joined" ON public.meeting_external_invites;
CREATE POLICY "Anon mark joined" ON public.meeting_external_invites
  FOR UPDATE TO anon
  USING (token IS NOT NULL)
  WITH CHECK (token IS NOT NULL);
