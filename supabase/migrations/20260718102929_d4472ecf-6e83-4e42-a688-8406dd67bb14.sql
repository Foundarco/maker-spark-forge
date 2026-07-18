
-- 1) Employee check helper (used by tightened RLS policies)
CREATE OR REPLACE FUNCTION public.is_employee(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;
REVOKE ALL ON FUNCTION public.is_employee(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_employee(uuid) TO authenticated, service_role;

-- 2) Replace overly-permissive USING(true) WITH CHECK(true) policies
DO $$
DECLARE
  r RECORD;
  emp_expr text := 'public.is_employee(auth.uid())';
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd = 'ALL'
      AND qual = 'true'
      AND with_check = 'true'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
      r.policyname, r.schemaname, r.tablename, emp_expr, emp_expr
    );
  END LOOP;
END $$;

-- 3) Lock down SECURITY DEFINER functions
-- Trigger-only functions: revoke direct execute (triggers still run as owner)
REVOKE ALL ON FUNCTION public.notify_channel_mentions() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_dm_recipient() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_meeting_time_entries() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_hq_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Helper functions used by RLS/RPC: keep authenticated, remove anon/public
REVOKE ALL ON FUNCTION public.has_role_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role_permission(uuid, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_route_access(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_route_access(uuid, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.drive_has_access(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.drive_has_access(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_suspended(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_suspended(uuid) TO authenticated, service_role;

-- Meeting invite RPCs: guests (anon) legitimately need these via token
REVOKE ALL ON FUNCTION public.get_meeting_invite_by_token(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_meeting_invite_by_token(text, uuid) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.mark_meeting_invite_joined(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_meeting_invite_joined(text, text) TO anon, authenticated, service_role;

-- 4) Tighten message-attachments storage read policy
DROP POLICY IF EXISTS "message-attachments read authenticated" ON storage.objects;
CREATE POLICY "message-attachments read participants"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments' AND (
    -- Uploader (files stored under their own uid folder)
    (storage.foldername(name))[1] = (auth.uid())::text
    -- Recipient/sender of a DM referencing this file
    OR EXISTS (
      SELECT 1 FROM public.direct_messages dm
      WHERE (dm.sender_id = auth.uid() OR dm.recipient_id = auth.uid())
        AND dm.attachments @> jsonb_build_array(jsonb_build_object('path', storage.objects.name))
    )
    -- Member of a channel whose message references this file
    OR EXISTS (
      SELECT 1
      FROM public.channel_messages cm
      JOIN public.channels c ON c.id = cm.channel_id
      WHERE cm.attachments @> jsonb_build_array(jsonb_build_object('path', storage.objects.name))
        AND (
          NOT c.is_private
          OR c.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.channel_members m
            WHERE m.channel_id = c.id AND m.user_id = auth.uid()
          )
        )
    )
  )
);
