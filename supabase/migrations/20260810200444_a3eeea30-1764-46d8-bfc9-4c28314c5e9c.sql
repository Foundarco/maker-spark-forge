CREATE TABLE public.hr_time_clock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  break_minutes numeric NOT NULL DEFAULT 0,
  break_started_at timestamptz,
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE SET NULL,
  project text,
  notes text,
  source text NOT NULL DEFAULT 'web',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_time_clock TO authenticated;
GRANT ALL ON public.hr_time_clock TO service_role;

ALTER TABLE public.hr_time_clock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own punches" ON public.hr_time_clock
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers manage all punches" ON public.hr_time_clock
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'super_admin') OR private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'manager') OR private.has_role(auth.uid(),'hr'))
  WITH CHECK (private.has_role(auth.uid(),'super_admin') OR private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'manager') OR private.has_role(auth.uid(),'hr'));

CREATE INDEX hr_time_clock_user_idx ON public.hr_time_clock (user_id, clock_in DESC);

CREATE TRIGGER hr_time_clock_updated_at BEFORE UPDATE ON public.hr_time_clock
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();