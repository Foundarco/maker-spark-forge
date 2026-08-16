CREATE OR REPLACE FUNCTION public.onboarding_invite_check(_email text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'ok',
    EXISTS (
      SELECT 1 FROM public.invites i
       WHERE lower(i.email) = lower(trim(_email))
         AND i.accepted_at IS NULL
         AND i.expires_at > now()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE lower(p.email) = lower(trim(_email))
    )
  );
$$;

REVOKE ALL ON FUNCTION public.onboarding_invite_check(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.onboarding_invite_check(text) TO anon, authenticated;