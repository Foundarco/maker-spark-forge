-- ORG TREE ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.org_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.org_units(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'team',
  description text,
  lead_id uuid,
  color text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_units TO authenticated;
GRANT ALL ON public.org_units TO service_role;
ALTER TABLE public.org_units ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_hq_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin')
  );
$$;

CREATE POLICY "org_units_read" ON public.org_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_units_admin" ON public.org_units FOR ALL TO authenticated
  USING (public.is_hq_admin(auth.uid())) WITH CHECK (public.is_hq_admin(auth.uid()));
CREATE TRIGGER org_units_updated BEFORE UPDATE ON public.org_units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ROLES ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.org_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  org_unit_id uuid REFERENCES public.org_units(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'custom',
  level text NOT NULL DEFAULT 'member',
  color text,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_roles TO authenticated;
GRANT ALL ON public.org_roles TO service_role;
ALTER TABLE public.org_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_roles_read" ON public.org_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_roles_admin" ON public.org_roles FOR ALL TO authenticated
  USING (public.is_hq_admin(auth.uid())) WITH CHECK (public.is_hq_admin(auth.uid()));
CREATE TRIGGER org_roles_updated BEFORE UPDATE ON public.org_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.org_role_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
  route text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, route)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_role_routes TO authenticated;
GRANT ALL ON public.org_role_routes TO service_role;
ALTER TABLE public.org_role_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_role_routes_read" ON public.org_role_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_role_routes_admin" ON public.org_role_routes FOR ALL TO authenticated
  USING (public.is_hq_admin(auth.uid())) WITH CHECK (public.is_hq_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.user_org_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_org_roles TO authenticated;
GRANT ALL ON public.user_org_roles TO service_role;
ALTER TABLE public.user_org_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_org_roles_self_read" ON public.user_org_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_hq_admin(auth.uid()));
CREATE POLICY "user_org_roles_admin" ON public.user_org_roles FOR ALL TO authenticated
  USING (public.is_hq_admin(auth.uid())) WITH CHECK (public.is_hq_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.user_route_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  route text NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, route)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_route_overrides TO authenticated;
GRANT ALL ON public.user_route_overrides TO service_role;
ALTER TABLE public.user_route_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_route_overrides_self_read" ON public.user_route_overrides FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_hq_admin(auth.uid()));
CREATE POLICY "user_route_overrides_admin" ON public.user_route_overrides FOR ALL TO authenticated
  USING (public.is_hq_admin(auth.uid())) WITH CHECK (public.is_hq_admin(auth.uid()));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS org_unit_id uuid REFERENCES public.org_units(id) ON DELETE SET NULL;
ALTER TABLE public.hr_employees ADD COLUMN IF NOT EXISTS org_unit_id uuid REFERENCES public.org_units(id) ON DELETE SET NULL;

-- ACCESS RESOLUTION ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.my_access()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  admin boolean;
  routes text[];
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('is_admin', false, 'routes', '[]'::jsonb); END IF;
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

  RETURN jsonb_build_object('is_admin', admin, 'routes', to_jsonb(routes));
END; $$;
GRANT EXECUTE ON FUNCTION public.my_access() TO authenticated;

-- SEED ORG TREE --------------------------------------------------------
INSERT INTO public.org_units (name, slug, kind, description, sort_order) VALUES
  ('Executive Office','executive','division','CEO and chief officers',0),
  ('Product / Program','product','division','Program and product management',1),
  ('Engineering','engineering','division','Aircraft and autonomy engineering',2),
  ('Manufacturing','manufacturing','division','Production and quality',3),
  ('Field Operations','field-operations','division','Flight and deployment operations',4),
  ('Software / Enterprise Systems','software','division','Internal platforms and systems',5),
  ('Commercial / Customer','commercial','division','Customers, partners and deployment',6),
  ('Operations','operations','division','Finance, legal, people, comms, strategy',7)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.org_units (parent_id, name, slug, kind, sort_order)
SELECT p.id, x.name, x.slug, 'team', x.ord
FROM (VALUES
  ('executive','Chief Executive Office','exec-ceo',0),
  ('executive','Operations (COO)','exec-coo',1),
  ('executive','Technology (CTO)','exec-cto',2),
  ('executive','Development & Grants','exec-development',3),
  ('executive','People','exec-people',4),
  ('executive','Safety & Risk','exec-safety',5),
  ('executive','Partnerships','exec-partnerships',6),
  ('executive','Legal Counsel','exec-legal',7),
  ('engineering','Airframe / Mechanical','eng-airframe',0),
  ('engineering','Electrical / Avionics','eng-avionics',1),
  ('engineering','Powertrain & Battery','eng-powertrain',2),
  ('engineering','Embedded Systems','eng-embedded',3),
  ('engineering','Autonomy','eng-autonomy',4),
  ('engineering','Perception / Computer Vision','eng-perception',5),
  ('engineering','Flight Software','eng-flight-software',6),
  ('engineering','Ground Systems','eng-ground-systems',7),
  ('engineering','Hardware Validation / Test','eng-validation',8),
  ('engineering','Reliability / Safety','eng-reliability',9),
  ('manufacturing','Manufacturing Engineering','mfg-engineering',0),
  ('manufacturing','Production','mfg-production',1),
  ('manufacturing','Tooling','mfg-tooling',2),
  ('manufacturing','Quality','mfg-quality',3),
  ('manufacturing','Test / End-of-Line','mfg-test',4),
  ('field-operations','Flight Operations','field-flight-ops',0),
  ('field-operations','UAS Operators','field-operators',1),
  ('field-operations','Maintenance','field-maintenance',2),
  ('field-operations','Deployment','field-deployment',3),
  ('field-operations','Fleet Operations','field-fleet',4),
  ('software','Operations Software','sw-operations',0),
  ('software','Fleet Systems','sw-fleet',1),
  ('software','Manufacturing Systems','sw-manufacturing',2),
  ('software','Supply Chain Systems','sw-supply-chain',3),
  ('software','Finance Systems','sw-finance',4),
  ('software','Internal Tools','sw-internal-tools',5),
  ('commercial','Customers','com-customers',0),
  ('commercial','Partnerships','com-partnerships',1),
  ('commercial','Market Deployment','com-market',2),
  ('operations','Finance','ops-finance',0),
  ('operations','Legal','ops-legal',1),
  ('operations','People / HR','ops-people',2),
  ('operations','Communications','ops-comms',3),
  ('operations','Strategy','ops-strategy',4)
) AS x(parent, name, slug, ord)
JOIN public.org_units p ON p.slug = x.parent
ON CONFLICT (slug) DO NOTHING;

-- SEED DEFAULT DEPARTMENT ROLES ---------------------------------------
INSERT INTO public.org_roles (name, slug, org_unit_id, kind, level, is_default, description)
SELECT u.name || ' — Member', u.slug || '-member', u.id, 'department', 'member', true,
       'Default access for the ' || u.name || ' team'
FROM public.org_units u
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.org_roles (name, slug, org_unit_id, kind, level, is_default, description)
SELECT u.name || ' — Lead', u.slug || '-lead', u.id, 'department', 'lead', false,
       'Team lead access for ' || u.name
FROM public.org_units u
ON CONFLICT (slug) DO NOTHING;

-- SEED ROUTE ACCESS ----------------------------------------------------
WITH map(unit, route) AS (VALUES
  ('executive','/analytics'),('executive','/company-tasks'),('executive','/org-chart'),('executive','/employees'),
  ('executive','/financial-reports'),('executive','/jobs'),('executive','/eng-projects'),('executive','/clients'),
  ('product','/eng-projects'),('product','/company-tasks'),('product','/analytics'),('product','/rd-ideas'),('product','/resource-planning'),
  ('engineering','/eng-projects'),('engineering','/plans'),('engineering','/takeoffs'),('engineering','/rfis'),
  ('engineering','/permits'),('engineering','/change-orders'),('engineering','/inspections'),('engineering','/rd-ideas'),
  ('manufacturing','/inventory'),('manufacturing','/purchase-orders'),('manufacturing','/suppliers'),
  ('manufacturing','/subcontractors'),('manufacturing','/receiving'),('manufacturing','/deliveries'),
  ('manufacturing','/equipment'),('manufacturing','/inspections'),
  ('field-operations','/jobs'),('field-operations','/scheduling'),('field-operations','/daily-logs'),
  ('field-operations','/crews'),('field-operations','/time-tracking'),('field-operations','/safety'),
  ('field-operations','/inspections'),('field-operations','/punch-list'),('field-operations','/equipment'),
  ('software','/eng-projects'),('software','/rd-ideas'),('software','/company-tasks'),('software','/analytics'),
  ('commercial','/clients'),('commercial','/client-comms'),('commercial','/live-chat'),('commercial','/customer-timeline'),
  ('commercial','/tickets'),('commercial','/kb'),('commercial','/leads'),('commercial','/proposals'),
  ('commercial','/quotes'),('commercial','/pipeline'),
  ('operations','/invoices'),('operations','/expenses'),('operations','/accounting'),('operations','/financial-reports'),
  ('operations','/job-costing'),('operations','/employees'),('operations','/hiring'),('operations','/applicants'),
  ('operations','/onboarding'),('operations','/attendance'),('operations','/time-off'),('operations','/certifications'),
  ('operations','/training'),('operations','/reviews'),('operations','/org-chart'),('operations','/admin/departments')
)
INSERT INTO public.org_role_routes (role_id, route)
SELECT r.id, m.route
FROM map m
JOIN public.org_units u ON u.slug = m.unit
LEFT JOIN public.org_units c ON c.parent_id = u.id
JOIN public.org_roles r ON r.org_unit_id = COALESCE(c.id, u.id)
ON CONFLICT (role_id, route) DO NOTHING;
