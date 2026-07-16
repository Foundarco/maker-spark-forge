
-- 1) activity_log: restrict SELECT to admins or the actor who logged the event
DROP POLICY IF EXISTS "activity read" ON public.activity_log;
CREATE POLICY "activity read admin or self" ON public.activity_log
  FOR SELECT TO authenticated
  USING (actor_id = auth.uid() OR private.is_hq_admin(auth.uid()));

-- 2) meeting_external_invites: remove blanket anon access
DROP POLICY IF EXISTS "Public lookup by token" ON public.meeting_external_invites;
DROP POLICY IF EXISTS "Anon mark joined" ON public.meeting_external_invites;

-- 3) Token-scoped helpers for guest flow (SECURITY DEFINER, filtered by supplied token)
CREATE OR REPLACE FUNCTION public.get_meeting_invite_by_token(_token text, _meeting_id uuid)
RETURNS TABLE (
  id uuid,
  meeting_id uuid,
  email text,
  name text,
  token text,
  joined_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT id, meeting_id, email, name, token, joined_at, created_at
  FROM public.meeting_external_invites
  WHERE token = _token
    AND meeting_id = _meeting_id
  LIMIT 1;
$fn$;

REVOKE ALL ON FUNCTION public.get_meeting_invite_by_token(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_meeting_invite_by_token(text, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_meeting_invite_joined(_token text, _name text DEFAULT NULL)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $fn$
  UPDATE public.meeting_external_invites
     SET joined_at = COALESCE(joined_at, now()),
         name = COALESCE(NULLIF(_name, ''), name)
   WHERE token = _token;
$fn$;

REVOKE ALL ON FUNCTION public.mark_meeting_invite_joined(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_meeting_invite_joined(text, text) TO anon, authenticated;
