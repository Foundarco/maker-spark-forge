
CREATE TABLE public.org_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  subdomain text NOT NULL UNIQUE,
  label text NOT NULL,
  tagline text,
  icon text,
  org_unit_id uuid REFERENCES public.org_units(id) ON DELETE SET NULL,
  landing_route text NOT NULL DEFAULT '/dashboard',
  nav_groups text[] NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  is_hub boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_apps TO authenticated;
GRANT ALL ON public.org_apps TO service_role;
ALTER TABLE public.org_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_apps readable by signed-in users"
  ON public.org_apps FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_apps managed by admins"
  ON public.org_apps FOR ALL TO authenticated
  USING (public.is_hq_admin(auth.uid()))
  WITH CHECK (public.is_hq_admin(auth.uid()));

CREATE TRIGGER org_apps_updated_at BEFORE UPDATE ON public.org_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.org_apps (slug, subdomain, label, tagline, icon, org_unit_id, landing_route, nav_groups, is_hub, sort_order)
VALUES ('hq','hq','Clovr HQ','Shared workspace',
        'Compass', NULL, '/dashboard',
        ARRAY['Core','Mission Operations','Engineering','Fleet & Supply','Research & Partners','Funding','People','Operations'],
        true, 0);

INSERT INTO public.org_apps (slug, subdomain, label, tagline, icon, org_unit_id, landing_route, nav_groups, sort_order)
SELECT x.slug, x.subdomain, x.label, x.tagline, x.icon, u.id, x.landing, x.groups, x.ord
FROM (VALUES
  ('exec','exec','Executive','Leadership and oversight','Compass','executive','/dashboard', ARRAY['Core','Operations','People','Funding']::text[], 1),
  ('product','product','Product & Program','Programs, roadmap, delivery','Target','product','/company-tasks', ARRAY['Core','Operations','Engineering']::text[], 2),
  ('eng','eng','Engineering','Aircraft, autonomy and test','Cpu','engineering','/eng-projects', ARRAY['Core','Engineering','Fleet & Supply']::text[], 3),
  ('mfg','mfg','Manufacturing','Production, tooling and quality','Boxes','manufacturing','/inventory', ARRAY['Core','Fleet & Supply','Engineering']::text[], 4),
  ('ops','ops','Mission Operations','Incidents, deployments, flight ops','Radar','field-operations','/jobs', ARRAY['Core','Mission Operations','Fleet & Supply']::text[], 5),
  ('systems','systems','Enterprise Systems','Internal platforms and access','Network','software','/admin/org', ARRAY['Core','Operations']::text[], 6),
  ('commercial','commercial','Commercial','Partners, funding, customers','Handshake','commercial','/pipeline', ARRAY['Core','Funding','Research & Partners']::text[], 7),
  ('admin','admin','Operations & Admin','People, finance and administration','IdCard','operations','/employees', ARRAY['Core','People','Operations','Funding']::text[], 8)
) AS x(slug, subdomain, label, tagline, icon, unit_slug, landing, groups, ord)
JOIN public.org_units u ON u.slug = x.unit_slug;

CREATE OR REPLACE FUNCTION public.my_access()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  admin boolean;
  routes text[];
  units text[];
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('is_admin', false, 'routes', '[]'::jsonb, 'units', '[]'::jsonb);
  END IF;
  admin := public.is_hq_admin(uid);

  SELECT coalesce(array_agg(DISTINCT r.route), '{}') INTO routes
  FROM (
    SELECT rr.route
      FROM public.user_org_roles uor
      JOIN public.org_role_routes rr ON rr.role_id = uor.role_id
     WHERE uor.user_id = uid
    UNION
    SELECT rr.route
      FROM public.profiles p
      JOIN public.org_roles orl ON orl.org_unit_id = p.org_unit_id AND orl.is_default
      JOIN public.org_role_routes rr ON rr.role_id = orl.id
     WHERE p.id = uid
    UNION
    SELECT o.route FROM public.user_route_overrides o WHERE o.user_id = uid AND o.granted
  ) r
  WHERE r.route NOT IN (
    SELECT route FROM public.user_route_overrides WHERE user_id = uid AND NOT granted
  );

  WITH direct AS (
    SELECT p.org_unit_id AS unit_id FROM public.profiles p WHERE p.id = uid AND p.org_unit_id IS NOT NULL
    UNION
    SELECT orl.org_unit_id
      FROM public.user_org_roles uor
      JOIN public.org_roles orl ON orl.id = uor.role_id
     WHERE uor.user_id = uid AND orl.org_unit_id IS NOT NULL
  ),
  tree AS (
    SELECT u.id, u.parent_id, u.slug FROM public.org_units u JOIN direct d ON d.unit_id = u.id
    UNION
    SELECT parent.id, parent.parent_id, parent.slug
      FROM public.org_units parent
      JOIN tree t ON t.parent_id = parent.id
  )
  SELECT coalesce(array_agg(DISTINCT tree.slug), '{}') INTO units FROM tree;

  RETURN jsonb_build_object('is_admin', admin, 'routes', to_jsonb(routes), 'units', to_jsonb(units));
END; $$;

GRANT EXECUTE ON FUNCTION public.my_access() TO authenticated;
