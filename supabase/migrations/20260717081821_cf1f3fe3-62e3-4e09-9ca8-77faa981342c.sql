
CREATE TABLE public.hr_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  title TEXT,
  department TEXT,
  manager_id UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  employment_type TEXT DEFAULT 'full_time',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  phone TEXT,
  location TEXT,
  salary NUMERIC,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_employees TO authenticated;
GRANT ALL ON public.hr_employees TO service_role;
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage employees" ON public.hr_employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_employees_updated_at BEFORE UPDATE ON public.hr_employees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  department TEXT,
  stage TEXT DEFAULT 'applied',
  source TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  rating INTEGER,
  interview_date DATE,
  interviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_applicants TO authenticated;
GRANT ALL ON public.hr_applicants TO service_role;
ALTER TABLE public.hr_applicants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage applicants" ON public.hr_applicants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_applicants_updated_at BEFORE UPDATE ON public.hr_applicants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours NUMERIC NOT NULL DEFAULT 0,
  project TEXT,
  task TEXT,
  notes TEXT,
  billable BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_time_entries TO authenticated;
GRANT ALL ON public.hr_time_entries TO service_role;
ALTER TABLE public.hr_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage time entries" ON public.hr_time_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_time_entries_updated_at BEFORE UPDATE ON public.hr_time_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'vacation',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days NUMERIC,
  status TEXT DEFAULT 'pending',
  reason TEXT,
  approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_time_off TO authenticated;
GRANT ALL ON public.hr_time_off TO service_role;
ALTER TABLE public.hr_time_off ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage time off" ON public.hr_time_off FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_time_off_updated_at BEFORE UPDATE ON public.hr_time_off FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  period TEXT,
  review_date DATE DEFAULT CURRENT_DATE,
  rating INTEGER,
  strengths TEXT,
  growth_areas TEXT,
  goals TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_reviews TO authenticated;
GRANT ALL ON public.hr_reviews TO service_role;
ALTER TABLE public.hr_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage reviews" ON public.hr_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_reviews_updated_at BEFORE UPDATE ON public.hr_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT,
  type TEXT,
  monthly_cost NUMERIC,
  employer_contribution NUMERIC,
  active BOOLEAN NOT NULL DEFAULT true,
  enrollment_deadline DATE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_benefits TO authenticated;
GRANT ALL ON public.hr_benefits TO service_role;
ALTER TABLE public.hr_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage benefits" ON public.hr_benefits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_benefits_updated_at BEFORE UPDATE ON public.hr_benefits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  task TEXT NOT NULL,
  category TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_onboarding TO authenticated;
GRANT ALL ON public.hr_onboarding TO service_role;
ALTER TABLE public.hr_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage onboarding" ON public.hr_onboarding FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_onboarding_updated_at BEFORE UPDATE ON public.hr_onboarding FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  content TEXT,
  version TEXT DEFAULT '1.0',
  active BOOLEAN NOT NULL DEFAULT true,
  effective_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_policies TO authenticated;
GRANT ALL ON public.hr_policies TO service_role;
ALTER TABLE public.hr_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage policies" ON public.hr_policies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_policies_updated_at BEFORE UPDATE ON public.hr_policies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  headcount INTEGER,
  budget NUMERIC,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_departments TO authenticated;
GRANT ALL ON public.hr_departments TO service_role;
ALTER TABLE public.hr_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage departments" ON public.hr_departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_departments_updated_at BEFORE UPDATE ON public.hr_departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.admin_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  purpose TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  ssl_active BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_domains TO authenticated;
GRANT ALL ON public.admin_domains TO service_role;
ALTER TABLE public.admin_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage domains" ON public.admin_domains FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER admin_domains_updated_at BEFORE UPDATE ON public.admin_domains FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'company',
  key TEXT NOT NULL,
  value TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_settings TO service_role;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage admin settings" ON public.admin_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.admin_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_permission_overrides TO authenticated;
GRANT ALL ON public.admin_permission_overrides TO service_role;
ALTER TABLE public.admin_permission_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage permission overrides" ON public.admin_permission_overrides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER admin_permission_overrides_updated_at BEFORE UPDATE ON public.admin_permission_overrides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
