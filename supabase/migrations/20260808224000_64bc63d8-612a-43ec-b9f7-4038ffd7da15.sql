-- 1. Move SECURITY DEFINER helpers out of the API-exposed schema
ALTER FUNCTION public.is_employee(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_suspended(uuid) SET SCHEMA private;
ALTER FUNCTION public.has_role_permission(uuid, text) SET SCHEMA private;
ALTER FUNCTION public.has_route_access(uuid, text) SET SCHEMA private;
ALTER FUNCTION public.drive_has_access(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.get_meeting_invite_by_token(text, uuid) SET SCHEMA private;
ALTER FUNCTION public.mark_meeting_invite_joined(text, text) SET SCHEMA private;

REVOKE ALL ON FUNCTION private.is_employee(uuid) FROM anon;
REVOKE ALL ON FUNCTION private.is_suspended(uuid) FROM anon;
REVOKE ALL ON FUNCTION private.has_role_permission(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION private.has_route_access(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION private.drive_has_access(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION private.get_meeting_invite_by_token(text, uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION private.mark_meeting_invite_joined(text, text) FROM anon, authenticated;

-- 2. Server-side anonymity for ideas and idea comments
CREATE OR REPLACE VIEW public.ideas_masked
WITH (security_invoker = on) AS
SELECT
  i.id,
  CASE
    WHEN i.is_anonymous
     AND i.author_id IS DISTINCT FROM auth.uid()
     AND NOT private.is_hq_admin(auth.uid())
    THEN NULL::uuid
    ELSE i.author_id
  END AS author_id,
  i.title,
  i.description,
  i.category,
  i.status,
  i.impact,
  i.effort,
  i.upvotes,
  i.created_at,
  i.updated_at,
  i.is_anonymous,
  i.approval_status,
  i.assigned_to,
  i.reviewed_by,
  i.reviewed_at,
  i.review_note
FROM public.ideas i;

CREATE OR REPLACE VIEW public.idea_comments_masked
WITH (security_invoker = on) AS
SELECT
  c.id,
  c.idea_id,
  CASE
    WHEN c.is_anonymous
     AND c.author_id IS DISTINCT FROM auth.uid()
     AND NOT private.is_hq_admin(auth.uid())
    THEN NULL::uuid
    ELSE c.author_id
  END AS author_id,
  c.body,
  c.is_anonymous,
  c.created_at
FROM public.idea_comments c;

GRANT SELECT ON public.ideas_masked TO authenticated;
GRANT SELECT ON public.idea_comments_masked TO authenticated;
GRANT ALL ON public.ideas_masked TO service_role;
GRANT ALL ON public.idea_comments_masked TO service_role;

-- 3. Base tables: only the author or an admin may read raw author_id rows for anonymous entries
DROP POLICY IF EXISTS "Authenticated can view ideas" ON public.ideas;
CREATE POLICY "Ideas readable, anonymous authors hidden"
ON public.ideas FOR SELECT TO authenticated
USING (
  private.is_employee(auth.uid())
  AND (
    NOT is_anonymous
    OR author_id = auth.uid()
    OR private.is_hq_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS idea_comments_select ON public.idea_comments;
CREATE POLICY "Comments readable, anonymous authors hidden"
ON public.idea_comments FOR SELECT TO authenticated
USING (
  private.is_employee(auth.uid())
  AND (
    NOT is_anonymous
    OR author_id = auth.uid()
    OR private.is_hq_admin(auth.uid())
  )
);