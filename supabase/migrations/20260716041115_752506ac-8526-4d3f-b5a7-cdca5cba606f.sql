INSERT INTO public.invites (email, role, full_name, expires_at)
VALUES ('camopeakinteractive@gmail.com', 'super_admin', 'Cam', now() + interval '30 days')
ON CONFLICT DO NOTHING;