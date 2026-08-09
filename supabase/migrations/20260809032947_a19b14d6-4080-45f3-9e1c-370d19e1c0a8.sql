ALTER TABLE public.con_estimates
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'moderate',
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payment_terms text,
  ADD COLUMN IF NOT EXISTS billing_address text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS note_to_customer text,
  ADD COLUMN IF NOT EXISTS quoted_date date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS taxable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tax_rate numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS revision_of uuid REFERENCES public.con_estimates(id) ON DELETE SET NULL;

ALTER TABLE public.con_estimate_lines
  ADD COLUMN IF NOT EXISTS unit_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS material_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS labor_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS equipment_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_time text,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE OR REPLACE FUNCTION public.con_estimate_recalc()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_est uuid;
  v_sub numeric;
  v_cost numeric;
  v_disc numeric;
  v_taxable boolean;
  v_rate numeric;
  v_total numeric;
BEGIN
  v_est := COALESCE(NEW.estimate_id, OLD.estimate_id);

  SELECT COALESCE(SUM(COALESCE(quantity,0) * COALESCE(unit_price,0)), 0),
         COALESCE(SUM(COALESCE(quantity,0) * (COALESCE(material_cost,0) + COALESCE(labor_cost,0) + COALESCE(equipment_cost,0))), 0)
    INTO v_sub, v_cost
  FROM public.con_estimate_lines WHERE estimate_id = v_est;

  SELECT COALESCE(discount_pct,0), COALESCE(taxable,false), COALESCE(tax_rate,0)
    INTO v_disc, v_taxable, v_rate
  FROM public.con_estimates WHERE id = v_est;

  v_total := v_sub * (1 - v_disc / 100.0);
  IF v_taxable THEN
    v_total := v_total * (1 + v_rate / 100.0);
  END IF;

  UPDATE public.con_estimates
     SET subtotal = v_sub, cost_total = v_cost, total = ROUND(v_total, 2)
   WHERE id = v_est;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_con_estimate_recalc ON public.con_estimate_lines;
CREATE TRIGGER trg_con_estimate_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.con_estimate_lines
FOR EACH ROW EXECUTE FUNCTION public.con_estimate_recalc();

CREATE OR REPLACE FUNCTION public.con_estimate_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare new_job uuid; jn text;
begin
  if new.status in ('approved','won') and coalesce(old.status,'') not in ('approved','won') then
    if new.job_id is null then
      jn := 'J-' || to_char(now(), 'YY') || '-' || lpad((coalesce((select count(*) from public.con_jobs), 0) + 1)::text, 4, '0');
      insert into public.con_jobs (job_number, name, client_id, stage, status, contract_value, estimated_cost, start_date, created_by)
      values (jn, coalesce(new.title, 'New job'), new.client_id, 'contract', 'active', coalesce(new.total, 0), coalesce(new.cost_total, new.subtotal, 0), current_date, new.created_by)
      returning id into new_job;
      new.job_id := new_job;
      insert into public.con_tasks (title, description, entity_type, entity_id, job_id, department, status, priority, due_date, created_by)
      values ('Kickoff: ' || coalesce(new.title,'job'), 'Quote won. Schedule kickoff, permits and crew.', 'job', new_job, new_job, 'project_management', 'open', 'high', current_date + 3, new.created_by);
    end if;
    new.approved_at := coalesce(new.approved_at, now());
    perform public.notify_user(new.estimator_id, 'Quote won', coalesce(new.title,'Quote') || ' was won. Job created.', '/jobs');
    insert into public.con_audit_log (actor_id, action, entity_type, entity_id, summary)
    values (auth.uid(), 'won', 'estimate', new.id, 'Quote won and job created');
  end if;
  return new;
end; $$;