
CREATE POLICY "drive upload own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'drive' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "drive read own or shared"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'drive' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS(
      SELECT 1 FROM public.drive_items di
      LEFT JOIN public.drive_shares ds ON ds.item_id = di.id
      LEFT JOIN public.user_custom_roles ucr ON ucr.role_id = ds.role_id AND ucr.user_id = auth.uid()
      WHERE di.storage_path = storage.objects.name
        AND (ds.user_id = auth.uid() OR ucr.user_id = auth.uid())
    )
    OR EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','admin'))
  )
);

CREATE POLICY "drive delete own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'drive' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "drive update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'drive' AND (storage.foldername(name))[1] = auth.uid()::text);
