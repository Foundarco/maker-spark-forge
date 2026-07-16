
-- ============ ENGINEERING ============

CREATE TABLE public.eng_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  lead_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date DATE,
  target_date DATE,
  progress INTEGER NOT NULL DEFAULT 0,
  budget NUMERIC(14,2),
  spent NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_projects TO authenticated;
GRANT ALL ON public.eng_projects TO service_role;
ALTER TABLE public.eng_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_projects_auth_all" ON public.eng_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_projects_updated BEFORE UPDATE ON public.eng_projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_tasks TO authenticated;
GRANT ALL ON public.eng_tasks TO service_role;
ALTER TABLE public.eng_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_tasks_auth_all" ON public.eng_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_tasks_updated BEFORE UPDATE ON public.eng_tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_milestones TO authenticated;
GRANT ALL ON public.eng_milestones TO service_role;
ALTER TABLE public.eng_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_milestones_auth_all" ON public.eng_milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_milestones_updated BEFORE UPDATE ON public.eng_milestones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_cad_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE SET NULL,
  part_number TEXT NOT NULL,
  name TEXT NOT NULL,
  revision TEXT NOT NULL DEFAULT 'A',
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  assembly TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_cad_parts TO authenticated;
GRANT ALL ON public.eng_cad_parts TO service_role;
ALTER TABLE public.eng_cad_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_cad_parts_auth_all" ON public.eng_cad_parts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_cad_parts_updated BEFORE UPDATE ON public.eng_cad_parts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_firmware_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  repo_url TEXT,
  language TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  latest_version TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_firmware_repos TO authenticated;
GRANT ALL ON public.eng_firmware_repos TO service_role;
ALTER TABLE public.eng_firmware_repos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_firmware_repos_auth_all" ON public.eng_firmware_repos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_firmware_repos_updated BEFORE UPDATE ON public.eng_firmware_repos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_bom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE CASCADE,
  part_number TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL DEFAULT 1,
  unit_cost NUMERIC(12,2),
  supplier TEXT,
  risk_level TEXT NOT NULL DEFAULT 'low',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_bom_items TO authenticated;
GRANT ALL ON public.eng_bom_items TO service_role;
ALTER TABLE public.eng_bom_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_bom_items_auth_all" ON public.eng_bom_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_bom_items_updated BEFORE UPDATE ON public.eng_bom_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_ecos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  requestor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_ecos TO authenticated;
GRANT ALL ON public.eng_ecos TO service_role;
ALTER TABLE public.eng_ecos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_ecos_auth_all" ON public.eng_ecos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_ecos_updated BEFORE UPDATE ON public.eng_ecos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_design_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  gate TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  review_date DATE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_design_reviews TO authenticated;
GRANT ALL ON public.eng_design_reviews TO service_role;
ALTER TABLE public.eng_design_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_design_reviews_auth_all" ON public.eng_design_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_design_reviews_updated BEFORE UPDATE ON public.eng_design_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  starred BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_docs TO authenticated;
GRANT ALL ON public.eng_docs TO service_role;
ALTER TABLE public.eng_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_docs_auth_all" ON public.eng_docs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_docs_updated BEFORE UPDATE ON public.eng_docs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.eng_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  category TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eng_issues TO authenticated;
GRANT ALL ON public.eng_issues TO service_role;
ALTER TABLE public.eng_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eng_issues_auth_all" ON public.eng_issues FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER eng_issues_updated BEFORE UPDATE ON public.eng_issues FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MANUFACTURING ============

CREATE TABLE public.mfg_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  rating INTEGER,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mfg_suppliers TO authenticated;
GRANT ALL ON public.mfg_suppliers TO service_role;
ALTER TABLE public.mfg_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfg_suppliers_auth_all" ON public.mfg_suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER mfg_suppliers_updated BEFORE UPDATE ON public.mfg_suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mfg_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  quantity NUMERIC(12,3) NOT NULL DEFAULT 0,
  reorder_point NUMERIC(12,3) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2),
  location TEXT,
  supplier_id UUID REFERENCES public.mfg_suppliers(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mfg_inventory TO authenticated;
GRANT ALL ON public.mfg_inventory TO service_role;
ALTER TABLE public.mfg_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfg_inventory_auth_all" ON public.mfg_inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER mfg_inventory_updated BEFORE UPDATE ON public.mfg_inventory FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mfg_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  project_id UUID REFERENCES public.eng_projects(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mfg_work_orders TO authenticated;
GRANT ALL ON public.mfg_work_orders TO service_role;
ALTER TABLE public.mfg_work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfg_work_orders_auth_all" ON public.mfg_work_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER mfg_work_orders_updated BEFORE UPDATE ON public.mfg_work_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mfg_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.mfg_suppliers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  order_date DATE,
  expected_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mfg_purchase_orders TO authenticated;
GRANT ALL ON public.mfg_purchase_orders TO service_role;
ALTER TABLE public.mfg_purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfg_purchase_orders_auth_all" ON public.mfg_purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER mfg_purchase_orders_updated BEFORE UPDATE ON public.mfg_purchase_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mfg_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES public.mfg_work_orders(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  defect_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  inspected_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mfg_inspections TO authenticated;
GRANT ALL ON public.mfg_inspections TO service_role;
ALTER TABLE public.mfg_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfg_inspections_auth_all" ON public.mfg_inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER mfg_inspections_updated BEFORE UPDATE ON public.mfg_inspections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
