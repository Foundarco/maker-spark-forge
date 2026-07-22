CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  project_type text,
  stage text,
  services text[] NOT NULL DEFAULT '{}',
  timeline text,
  budget text,
  description text NOT NULL,
  source text,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.quote_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote request"
  ON public.quote_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Employees can view quote requests"
  ON public.quote_requests FOR SELECT
  TO authenticated
  USING (public.is_employee(auth.uid()));

CREATE POLICY "Employees can update quote requests"
  ON public.quote_requests FOR UPDATE
  TO authenticated
  USING (public.is_employee(auth.uid()))
  WITH CHECK (public.is_employee(auth.uid()));

CREATE POLICY "Employees can delete quote requests"
  ON public.quote_requests FOR DELETE
  TO authenticated
  USING (public.is_employee(auth.uid()));

CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX quote_requests_status_idx ON public.quote_requests (status, created_at DESC);