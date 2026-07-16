
DROP POLICY IF EXISTS "anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "anyone can submit contact" ON public.contact_submissions
  FOR INSERT TO public
  WITH CHECK (email IS NOT NULL AND length(email) > 0);

DROP POLICY IF EXISTS "anyone can submit interest" ON public.interest_submissions;
CREATE POLICY "anyone can submit interest" ON public.interest_submissions
  FOR INSERT TO public
  WITH CHECK (email IS NOT NULL AND length(email) > 0);

DROP POLICY IF EXISTS "anyone can subscribe" ON public.newsletter_signups;
CREATE POLICY "anyone can subscribe" ON public.newsletter_signups
  FOR INSERT TO public
  WITH CHECK (email IS NOT NULL AND length(email) > 0);
