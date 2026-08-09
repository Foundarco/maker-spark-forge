CREATE TABLE public.con_schedule_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  resource_type text NOT NULL DEFAULT 'crew',
  crew_id uuid REFERENCES public.con_crews(id) ON DELETE SET NULL,
  equipment_id uuid REFERENCES public.con_equipment(id) ON DELETE SET NULL,
  title text NOT NULL,
  phase text,
  scheduled_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time time,
  duration_hours numeric NOT NULL DEFAULT 8,
  status text NOT NULL DEFAULT 'scheduled',
  priority text NOT NULL DEFAULT 'moderate',
  assignee_id uuid,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_schedule_blocks TO authenticated;
GRANT ALL ON public.con_schedule_blocks TO service_role;

ALTER TABLE public.con_schedule_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees manage schedule blocks"
ON public.con_schedule_blocks FOR ALL TO authenticated
USING (private.is_employee(auth.uid()))
WITH CHECK (private.is_employee(auth.uid()));

CREATE TRIGGER con_schedule_blocks_updated
BEFORE UPDATE ON public.con_schedule_blocks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX con_schedule_blocks_date_idx ON public.con_schedule_blocks (scheduled_date);
CREATE INDEX con_schedule_blocks_crew_idx ON public.con_schedule_blocks (crew_id);
CREATE INDEX con_schedule_blocks_equipment_idx ON public.con_schedule_blocks (equipment_id);

ALTER TABLE public.con_jobs
  ADD COLUMN IF NOT EXISTS est_labor_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS est_material_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS est_equipment_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_labor_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_material_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_equipment_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_other_cost numeric NOT NULL DEFAULT 0;