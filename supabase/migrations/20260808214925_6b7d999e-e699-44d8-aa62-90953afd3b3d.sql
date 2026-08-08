
-- ============ CLIENTS ============
CREATE TABLE public.con_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  client_type text DEFAULT 'residential',
  status text NOT NULL DEFAULT 'active',
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_clients TO authenticated;
GRANT ALL ON public.con_clients TO service_role;
ALTER TABLE public.con_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage clients" ON public.con_clients FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_clients_updated BEFORE UPDATE ON public.con_clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ JOBS ============
CREATE TABLE public.con_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number text UNIQUE,
  name text NOT NULL,
  client_id uuid REFERENCES public.con_clients(id) ON DELETE SET NULL,
  address text,
  city text,
  state text,
  zip text,
  job_type text DEFAULT 'construction',
  division text DEFAULT 'construction',
  stage text NOT NULL DEFAULT 'lead',
  status text NOT NULL DEFAULT 'active',
  contract_value numeric DEFAULT 0,
  estimated_cost numeric DEFAULT 0,
  actual_cost numeric DEFAULT 0,
  billed numeric DEFAULT 0,
  percent_complete int DEFAULT 0,
  start_date date,
  target_end_date date,
  actual_end_date date,
  project_manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  superintendent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  photo_url text,
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_jobs TO authenticated;
GRANT ALL ON public.con_jobs TO service_role;
ALTER TABLE public.con_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage jobs" ON public.con_jobs FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_jobs_updated BEFORE UPDATE ON public.con_jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX con_jobs_client_idx ON public.con_jobs(client_id);
CREATE INDEX con_jobs_stage_idx ON public.con_jobs(stage);

-- ============ ESTIMATES ============
CREATE TABLE public.con_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number text,
  title text NOT NULL,
  client_id uuid REFERENCES public.con_clients(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  scope text,
  subtotal numeric DEFAULT 0,
  markup_pct numeric DEFAULT 15,
  total numeric DEFAULT 0,
  valid_until date,
  estimator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_estimates TO authenticated;
GRANT ALL ON public.con_estimates TO service_role;
ALTER TABLE public.con_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage estimates" ON public.con_estimates FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_estimates_updated BEFORE UPDATE ON public.con_estimates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.con_estimate_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES public.con_estimates(id) ON DELETE CASCADE,
  category text,
  description text NOT NULL,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'ea',
  unit_cost numeric DEFAULT 0,
  total numeric DEFAULT 0,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_estimate_lines TO authenticated;
GRANT ALL ON public.con_estimate_lines TO service_role;
ALTER TABLE public.con_estimate_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage estimate lines" ON public.con_estimate_lines FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_estimate_lines_updated BEFORE UPDATE ON public.con_estimate_lines FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX con_estimate_lines_est_idx ON public.con_estimate_lines(estimate_id);

-- ============ CREWS ============
CREATE TABLE public.con_crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trade text,
  foreman_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  size int DEFAULT 0,
  status text NOT NULL DEFAULT 'available',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_crews TO authenticated;
GRANT ALL ON public.con_crews TO service_role;
ALTER TABLE public.con_crews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage crews" ON public.con_crews FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_crews_updated BEFORE UPDATE ON public.con_crews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.con_crew_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid REFERENCES public.con_crews(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  role text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_crew_assignments TO authenticated;
GRANT ALL ON public.con_crew_assignments TO service_role;
ALTER TABLE public.con_crew_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage crew assignments" ON public.con_crew_assignments FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_crew_assign_updated BEFORE UPDATE ON public.con_crew_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX con_crew_assign_job_idx ON public.con_crew_assignments(job_id);

-- ============ DAILY LOGS ============
CREATE TABLE public.con_daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  weather text,
  temperature text,
  crew_count int DEFAULT 0,
  hours_worked numeric DEFAULT 0,
  work_performed text,
  delays text,
  materials_received text,
  visitors text,
  photos text[],
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_daily_logs TO authenticated;
GRANT ALL ON public.con_daily_logs TO service_role;
ALTER TABLE public.con_daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage daily logs" ON public.con_daily_logs FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_daily_logs_updated BEFORE UPDATE ON public.con_daily_logs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX con_daily_logs_job_idx ON public.con_daily_logs(job_id, log_date DESC);

-- ============ EQUIPMENT ============
CREATE TABLE public.con_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  asset_tag text,
  category text,
  make text,
  model text,
  year int,
  status text NOT NULL DEFAULT 'available',
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  hours_meter numeric DEFAULT 0,
  odometer numeric DEFAULT 0,
  next_service_date date,
  next_service_hours numeric,
  purchase_cost numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_equipment TO authenticated;
GRANT ALL ON public.con_equipment TO service_role;
ALTER TABLE public.con_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage equipment" ON public.con_equipment FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_equipment_updated BEFORE UPDATE ON public.con_equipment FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SAFETY ============
CREATE TABLE public.con_safety_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE SET NULL,
  incident_date date NOT NULL DEFAULT CURRENT_DATE,
  incident_type text,
  severity text NOT NULL DEFAULT 'minor',
  description text,
  involved_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  osha_reportable boolean DEFAULT false,
  lost_time_hours numeric DEFAULT 0,
  corrective_action text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_safety_incidents TO authenticated;
GRANT ALL ON public.con_safety_incidents TO service_role;
ALTER TABLE public.con_safety_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage incidents" ON public.con_safety_incidents FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_incidents_updated BEFORE UPDATE ON public.con_safety_incidents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.con_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  inspection_type text,
  scheduled_date date,
  completed_date date,
  inspector text,
  inspector_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  result text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_inspections TO authenticated;
GRANT ALL ON public.con_inspections TO service_role;
ALTER TABLE public.con_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage inspections" ON public.con_inspections FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_inspections_updated BEFORE UPDATE ON public.con_inspections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.con_punch_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  title text NOT NULL,
  location text,
  trade text,
  description text,
  assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date date,
  priority text DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_punch_items TO authenticated;
GRANT ALL ON public.con_punch_items TO service_role;
ALTER TABLE public.con_punch_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage punch items" ON public.con_punch_items FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_punch_updated BEFORE UPDATE ON public.con_punch_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PERMITS / SUBMITTALS / CHANGE ORDERS ============
CREATE TABLE public.con_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  permit_type text,
  authority text,
  permit_number text,
  applied_date date,
  issued_date date,
  expires_date date,
  inspection_date date,
  fee numeric,
  status text NOT NULL DEFAULT 'applied',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_permits TO authenticated;
GRANT ALL ON public.con_permits TO service_role;
ALTER TABLE public.con_permits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage permits" ON public.con_permits FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_permits_updated BEFORE UPDATE ON public.con_permits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.con_submittals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'rfi',
  number text,
  title text NOT NULL,
  spec_section text,
  question text,
  answer text,
  ball_in_court uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date date,
  responded_at timestamptz,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_submittals TO authenticated;
GRANT ALL ON public.con_submittals TO service_role;
ALTER TABLE public.con_submittals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage submittals" ON public.con_submittals FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_submittals_updated BEFORE UPDATE ON public.con_submittals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.con_change_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  co_number text,
  title text NOT NULL,
  scope text,
  cost_delta numeric DEFAULT 0,
  days_delta int DEFAULT 0,
  reason text,
  requested_by text,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_change_orders TO authenticated;
GRANT ALL ON public.con_change_orders TO service_role;
ALTER TABLE public.con_change_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage change orders" ON public.con_change_orders FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_change_orders_updated BEFORE UPDATE ON public.con_change_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SUBCONTRACTORS / DELIVERIES ============
CREATE TABLE public.con_subcontractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trade text,
  contact_name text,
  email text,
  phone text,
  license_number text,
  insurance_expires date,
  w9_on_file boolean DEFAULT false,
  rating int,
  hourly_rate numeric,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_subcontractors TO authenticated;
GRANT ALL ON public.con_subcontractors TO service_role;
ALTER TABLE public.con_subcontractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage subs" ON public.con_subcontractors FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_subs_updated BEFORE UPDATE ON public.con_subcontractors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.con_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE SET NULL,
  po_id uuid REFERENCES public.mfg_purchase_orders(id) ON DELETE SET NULL,
  supplier text,
  material text NOT NULL,
  quantity numeric,
  unit text,
  expected_date date,
  received_date date,
  received_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'expected',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_deliveries TO authenticated;
GRANT ALL ON public.con_deliveries TO service_role;
ALTER TABLE public.con_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage deliveries" ON public.con_deliveries FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_deliveries_updated BEFORE UPDATE ON public.con_deliveries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ UNIFIED TASKS ============
CREATE TABLE public.con_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  entity_type text DEFAULT 'company',
  entity_id uuid,
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  department text,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'not_started',
  due_date date,
  blocked_reason text,
  depends_on uuid REFERENCES public.con_tasks(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_tasks TO authenticated;
GRANT ALL ON public.con_tasks TO service_role;
ALTER TABLE public.con_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage tasks" ON public.con_tasks FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_tasks_updated BEFORE UPDATE ON public.con_tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX con_tasks_entity_idx ON public.con_tasks(entity_type, entity_id);
CREATE INDEX con_tasks_assignee_idx ON public.con_tasks(assignee_id);

-- ============ CONTEXTUAL MESSAGES ============
CREATE TABLE public.con_context_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'message',
  body text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  mentions uuid[],
  attachments jsonb,
  internal boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_context_messages TO authenticated;
GRANT ALL ON public.con_context_messages TO service_role;
ALTER TABLE public.con_context_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage context messages" ON public.con_context_messages FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_ctx_msgs_updated BEFORE UPDATE ON public.con_context_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX con_ctx_msgs_entity_idx ON public.con_context_messages(entity_type, entity_id, created_at DESC);

-- ============ DOCUMENTS ============
CREATE TABLE public.con_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  doc_type text DEFAULT 'document',
  entity_type text DEFAULT 'company',
  entity_id uuid,
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE CASCADE,
  version text DEFAULT '1.0',
  is_latest boolean DEFAULT true,
  supersedes uuid REFERENCES public.con_documents(id) ON DELETE SET NULL,
  file_url text,
  file_size bigint,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_documents TO authenticated;
GRANT ALL ON public.con_documents TO service_role;
ALTER TABLE public.con_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage documents" ON public.con_documents FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER con_documents_updated BEFORE UPDATE ON public.con_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX con_documents_entity_idx ON public.con_documents(entity_type, entity_id);

-- ============ HR: CERTIFICATIONS + TRAINING ============
CREATE TABLE public.hr_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  issuer text,
  issue_date date,
  expires_date date,
  document_url text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_certifications TO authenticated;
GRANT ALL ON public.hr_certifications TO service_role;
ALTER TABLE public.hr_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage certifications" ON public.hr_certifications FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER hr_certifications_updated BEFORE UPDATE ON public.hr_certifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hr_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  course text NOT NULL,
  category text,
  required boolean DEFAULT true,
  instructor text,
  completed_date date,
  expires_date date,
  score text,
  document_url text,
  status text NOT NULL DEFAULT 'assigned',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_training TO authenticated;
GRANT ALL ON public.hr_training TO service_role;
ALTER TABLE public.hr_training ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees manage training" ON public.hr_training FOR ALL TO authenticated
  USING (public.is_employee(auth.uid())) WITH CHECK (public.is_employee(auth.uid()));
CREATE TRIGGER hr_training_updated BEFORE UPDATE ON public.hr_training FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ANNOUNCEMENT ACKS ============
CREATE TABLE public.announcement_acks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  UNIQUE (announcement_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcement_acks TO authenticated;
GRANT ALL ON public.announcement_acks TO service_role;
ALTER TABLE public.announcement_acks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees read acks" ON public.announcement_acks FOR SELECT TO authenticated
  USING (public.is_employee(auth.uid()));
CREATE POLICY "users write own acks" ON public.announcement_acks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own acks" ON public.announcement_acks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ AUDIT TRAIL ============
CREATE TABLE public.con_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  field text,
  old_value text,
  new_value text,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.con_audit_log TO authenticated;
GRANT ALL ON public.con_audit_log TO service_role;
ALTER TABLE public.con_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees read audit" ON public.con_audit_log FOR SELECT TO authenticated
  USING (public.is_employee(auth.uid()));
CREATE POLICY "employees write audit" ON public.con_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.is_employee(auth.uid()));
CREATE INDEX con_audit_entity_idx ON public.con_audit_log(entity_type, entity_id, created_at DESC);

-- ============ SEED DATA ============
INSERT INTO public.con_clients (id, name, company, email, phone, address, city, state, zip, client_type, status) VALUES
 ('11111111-1111-4111-8111-000000000001','Dana Whitfield','Whitfield Residence','dana@whitfield.example','(319) 555-0142','1420 Oak Ridge Rd','Cedar Rapids','IA','52402','residential','active'),
 ('11111111-1111-4111-8111-000000000002','Ellis Park Development','Ellis Park LLC','pm@ellispark.example','(319) 555-0188','88 Commerce Dr','Marion','IA','52302','commercial','active'),
 ('11111111-1111-4111-8111-000000000003','Sarah Boone','Boone Family Trust','sarah.boone@example.com','(563) 555-0119','7 Larkspur Ln','Iowa City','IA','52240','residential','active');

INSERT INTO public.con_jobs (id, job_number, name, client_id, address, city, state, zip, job_type, stage, status, contract_value, estimated_cost, actual_cost, billed, percent_complete, start_date, target_end_date, description) VALUES
 ('22222222-2222-4222-8222-000000000001','J-1024','Whitfield Kitchen & Addition','11111111-1111-4111-8111-000000000001','1420 Oak Ridge Rd','Cedar Rapids','IA','52402','remodel','active','active',248000,196000,121400,140000,58,CURRENT_DATE - 40,CURRENT_DATE + 55,'Full kitchen remodel plus 640sf rear addition.'),
 ('22222222-2222-4222-8222-000000000002','J-1025','Ellis Park Retail Shell','11111111-1111-4111-8111-000000000002','88 Commerce Dr','Marion','IA','52302','commercial','active','active',1450000,1180000,410000,395000,31,CURRENT_DATE - 22,CURRENT_DATE + 180,'12,000sf retail shell with site concrete and utilities.'),
 ('22222222-2222-4222-8222-000000000003','J-1026','Boone Deck & Site Work','11111111-1111-4111-8111-000000000003','7 Larkspur Ln','Iowa City','IA','52240','exterior','estimate','active',62000,48000,0,0,0,NULL,NULL,'Composite deck, retaining wall, and grading.');

INSERT INTO public.con_crews (id, name, trade, size, status, notes) VALUES
 ('33333333-3333-4333-8333-000000000001','Crew A — Framing','Carpentry',6,'assigned','Primary framing crew'),
 ('33333333-3333-4333-8333-000000000002','Crew B — Concrete','Concrete',5,'assigned','Flatwork and foundations'),
 ('33333333-3333-4333-8333-000000000003','Crew C — Finish','Finish Carpentry',4,'available','Trim, cabinetry, punch');

INSERT INTO public.con_crew_assignments (crew_id, job_id, role, start_date, end_date, status) VALUES
 ('33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000001','Framing & addition shell',CURRENT_DATE - 20,CURRENT_DATE + 10,'active'),
 ('33333333-3333-4333-8333-000000000002','22222222-2222-4222-8222-000000000002','Site concrete',CURRENT_DATE - 15,CURRENT_DATE + 30,'active');

INSERT INTO public.con_equipment (name, asset_tag, category, make, model, year, status, job_id, hours_meter, next_service_date) VALUES
 ('Excavator 320','EQ-001','Heavy Equipment','Caterpillar','320',2019,'in_use','22222222-2222-4222-8222-000000000002',4820,CURRENT_DATE + 21),
 ('Skid Steer S650','EQ-002','Heavy Equipment','Bobcat','S650',2021,'in_use','22222222-2222-4222-8222-000000000001',2110,CURRENT_DATE + 9),
 ('Crew Truck F-250','EQ-003','Fleet','Ford','F-250',2022,'available',NULL,0,CURRENT_DATE + 45),
 ('Telehandler TL943','EQ-004','Heavy Equipment','JCB','TL943',2018,'maintenance',NULL,7340,CURRENT_DATE - 3);

INSERT INTO public.con_subcontractors (name, trade, contact_name, email, phone, insurance_expires, w9_on_file, rating, status) VALUES
 ('Linn County Electric','Electrical','Marty Voss','marty@lce.example','(319) 555-0170',CURRENT_DATE + 120,true,5,'active'),
 ('Prairie Mechanical','HVAC & Plumbing','Dee Ramirez','dee@prairiemech.example','(319) 555-0133',CURRENT_DATE + 28,true,4,'active'),
 ('Summit Roofing','Roofing','Cal Jensen','cal@summitroof.example','(563) 555-0155',CURRENT_DATE - 5,false,3,'review');

INSERT INTO public.con_estimates (id, estimate_number, title, client_id, job_id, status, scope, subtotal, markup_pct, total, valid_until) VALUES
 ('44444444-4444-4444-8444-000000000001','EST-2031','Boone Deck & Site Work','11111111-1111-4111-8111-000000000003','22222222-2222-4222-8222-000000000003','sent','Composite deck 480sf, block retaining wall, grading and seed.',53900,15,62000,CURRENT_DATE + 21);

INSERT INTO public.con_estimate_lines (estimate_id, category, description, quantity, unit, unit_cost, total, sort_order) VALUES
 ('44444444-4444-4444-8444-000000000001','Labor','Deck framing and decking labor',180,'hr',68,12240,1),
 ('44444444-4444-4444-8444-000000000001','Materials','Composite decking and framing lumber',1,'ls',18600,18600,2),
 ('44444444-4444-4444-8444-000000000001','Sitework','Retaining wall block and base',1,'ls',14300,14300,3),
 ('44444444-4444-4444-8444-000000000001','Sitework','Grading, topsoil and seed',1,'ls',8760,8760,4);

INSERT INTO public.con_daily_logs (job_id, log_date, weather, temperature, crew_count, hours_worked, work_performed, delays) VALUES
 ('22222222-2222-4222-8222-000000000001',CURRENT_DATE - 1,'Clear','62F',6,48,'Set addition roof trusses, sheathed north wall.',NULL),
 ('22222222-2222-4222-8222-000000000002',CURRENT_DATE - 1,'Rain','54F',5,20,'Formed footings east side; stopped early for weather.','Rain — lost 4 hrs, pour moved to Thursday.');

INSERT INTO public.con_permits (job_id, permit_type, authority, permit_number, applied_date, issued_date, inspection_date, status) VALUES
 ('22222222-2222-4222-8222-000000000001','Building','City of Cedar Rapids','BLD-24-8871',CURRENT_DATE - 60,CURRENT_DATE - 48,CURRENT_DATE + 6,'issued'),
 ('22222222-2222-4222-8222-000000000002','Site / Grading','City of Marion','SIT-24-1190',CURRENT_DATE - 35,CURRENT_DATE - 25,NULL,'issued'),
 ('22222222-2222-4222-8222-000000000002','Electrical','Linn County','ELE-24-4402',CURRENT_DATE - 10,NULL,NULL,'applied');

INSERT INTO public.con_submittals (job_id, kind, number, title, spec_section, question, due_date, status) VALUES
 ('22222222-2222-4222-8222-000000000002','rfi','RFI-004','Storefront header elevation conflict','08 41 13','Header elevation conflicts with duct main at grid C4. Confirm revised elevation.',CURRENT_DATE + 3,'open'),
 ('22222222-2222-4222-8222-000000000001','submittal','SUB-011','Cabinet shop drawings','06 41 00',NULL,CURRENT_DATE + 7,'in_review');

INSERT INTO public.con_change_orders (job_id, co_number, title, scope, cost_delta, days_delta, status) VALUES
 ('22222222-2222-4222-8222-000000000001','CO-002','Upgrade kitchen window package','Swap to clad triple-pane units per client selection.',8400,3,'pending');

INSERT INTO public.con_safety_incidents (job_id, incident_date, incident_type, severity, description, osha_reportable, corrective_action, status) VALUES
 ('22222222-2222-4222-8222-000000000002',CURRENT_DATE - 6,'Near miss','minor','Unsecured rebar cap near form line.',false,'Caps installed site-wide; toolbox talk held.','closed');

INSERT INTO public.con_inspections (job_id, inspection_type, scheduled_date, result, status) VALUES
 ('22222222-2222-4222-8222-000000000001','Framing',CURRENT_DATE + 6,NULL,'scheduled'),
 ('22222222-2222-4222-8222-000000000002','Footing',CURRENT_DATE - 4,'pass','complete');

INSERT INTO public.con_punch_items (job_id, title, location, trade, priority, status) VALUES
 ('22222222-2222-4222-8222-000000000001','Touch up drywall seam','Addition — north wall','Drywall','medium','open'),
 ('22222222-2222-4222-8222-000000000001','Adjust cabinet door alignment','Kitchen','Finish Carpentry','low','open');

INSERT INTO public.con_deliveries (job_id, supplier, material, quantity, unit, expected_date, status) VALUES
 ('22222222-2222-4222-8222-000000000002','Cedar Valley Ready Mix','4000 PSI concrete',42,'cy',CURRENT_DATE + 2,'expected'),
 ('22222222-2222-4222-8222-000000000001','Midwest Millwork','Cabinet package',1,'ls',CURRENT_DATE + 9,'expected');

INSERT INTO public.con_tasks (title, entity_type, job_id, priority, status, due_date, department) VALUES
 ('Respond to RFI-004 header conflict','job','22222222-2222-4222-8222-000000000002','high','in_progress',CURRENT_DATE + 2,'Project Management'),
 ('Approve CO-002 window upgrade','job','22222222-2222-4222-8222-000000000001','high','waiting',CURRENT_DATE + 1,'Executive'),
 ('Renew Summit Roofing insurance certificate','company',NULL,'high','blocked',CURRENT_DATE,'Procurement'),
 ('Schedule framing inspection','job','22222222-2222-4222-8222-000000000001','medium','not_started',CURRENT_DATE + 4,'Field Operations');
