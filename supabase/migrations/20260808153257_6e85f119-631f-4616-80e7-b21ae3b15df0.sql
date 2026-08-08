CREATE POLICY "Anyone can upload project request photos"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'project-request-photos');

CREATE POLICY "Employees can view project request photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-request-photos' AND public.is_employee(auth.uid()));

CREATE POLICY "Employees can delete project request photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-request-photos' AND public.is_employee(auth.uid()));