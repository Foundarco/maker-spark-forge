ALTER TABLE public.org_apps
  ADD COLUMN IF NOT EXISTS accent text,
  ADD COLUMN IF NOT EXISTS accent_dark text,
  ADD COLUMN IF NOT EXISTS layout text NOT NULL DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS short_code text;

UPDATE public.org_apps SET accent='oklch(0.585 0.222 27)', accent_dark='oklch(0.66 0.19 27)', layout='classic', short_code='HQ' WHERE slug='hq';
UPDATE public.org_apps SET accent='oklch(0.52 0.13 285)', accent_dark='oklch(0.68 0.14 285)', layout='executive', short_code='EX' WHERE slug='exec';
UPDATE public.org_apps SET accent='oklch(0.60 0.16 320)', accent_dark='oklch(0.72 0.15 320)', layout='board', short_code='PP' WHERE slug='product';
UPDATE public.org_apps SET accent='oklch(0.62 0.14 220)', accent_dark='oklch(0.74 0.13 220)', layout='rail', short_code='EN' WHERE slug='eng';
UPDATE public.org_apps SET accent='oklch(0.63 0.15 60)', accent_dark='oklch(0.76 0.15 75)', layout='industrial', short_code='MF' WHERE slug='mfg';
UPDATE public.org_apps SET accent='oklch(0.60 0.20 27)', accent_dark='oklch(0.70 0.19 30)', layout='ops', short_code='OPS' WHERE slug='ops';
UPDATE public.org_apps SET accent='oklch(0.58 0.13 170)', accent_dark='oklch(0.72 0.13 170)', layout='console', short_code='SYS' WHERE slug='systems';
UPDATE public.org_apps SET accent='oklch(0.60 0.15 145)', accent_dark='oklch(0.73 0.14 145)', layout='board', short_code='CO' WHERE slug='commercial';
UPDATE public.org_apps SET accent='oklch(0.55 0.10 250)', accent_dark='oklch(0.70 0.10 250)', layout='classic', short_code='AD' WHERE slug='admin';

INSERT INTO public.user_roles (user_id, role)
SELECT '20293dd9-9b87-49e2-98f2-61fdd193398a'::uuid, 'super_admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = '20293dd9-9b87-49e2-98f2-61fdd193398a' AND role = 'super_admin'
);