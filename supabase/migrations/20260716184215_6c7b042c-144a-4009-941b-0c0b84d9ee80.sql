
-- Enable Realtime for messaging + ideas
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ideas;

-- Extend ideas: anonymous flag, approval workflow, assignment
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_note text;

-- Admin can update any idea (approve/deny/assign), assignee can update status
CREATE POLICY "Admins manage ideas" ON public.ideas
  FOR UPDATE TO authenticated
  USING (public.is_hq_admin(auth.uid()))
  WITH CHECK (public.is_hq_admin(auth.uid()));

CREATE POLICY "Admins delete ideas" ON public.ideas
  FOR DELETE TO authenticated
  USING (public.is_hq_admin(auth.uid()));

-- Comment thread on ideas
CREATE TABLE public.idea_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.idea_comments TO authenticated;
GRANT ALL ON public.idea_comments TO service_role;
ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "idea_comments_select" ON public.idea_comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "idea_comments_insert" ON public.idea_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "idea_comments_delete_own_or_admin" ON public.idea_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.is_hq_admin(auth.uid()));

CREATE INDEX idea_comments_idea_idx ON public.idea_comments(idea_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.idea_comments;
