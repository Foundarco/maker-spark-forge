CREATE TABLE public.project_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  project_type text NOT NULL,
  description text NOT NULL,
  timeline text,
  budget text,
  photo_urls text[] NOT NULL DEFAULT '{}',
  additional_info text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.project_requests TO authenticated;
GRANT ALL ON public.project_requests TO service_role;

ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view project requests"
  ON public.project_requests FOR SELECT TO authenticated
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Employees can update project requests"
  ON public.project_requests FOR UPDATE TO authenticated
  USING (public.is_employee(auth.uid()))
  WITH CHECK (public.is_employee(auth.uid()));

CREATE POLICY "Employees can delete project requests"
  ON public.project_requests FOR DELETE TO authenticated
  USING (public.is_employee(auth.uid()));

CREATE TRIGGER update_project_requests_updated_at
  BEFORE UPDATE ON public.project_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();