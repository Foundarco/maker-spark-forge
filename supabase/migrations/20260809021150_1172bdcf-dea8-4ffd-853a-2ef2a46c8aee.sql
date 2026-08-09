-- ============ LEADS ============
CREATE TABLE public.con_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_number text,
  title text NOT NULL,
  client_id uuid REFERENCES public.con_clients(id) ON DELETE SET NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  source text,
  project_type text,
  location text,
  estimated_value numeric DEFAULT 0,
  probability integer DEFAULT 50,
  stage text NOT NULL DEFAULT 'new',
  bid_due_date date,
  walkthrough_date date,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  estimate_id uuid REFERENCES public.con_estimates(id) ON DELETE SET NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_leads TO authenticated;
GRANT ALL ON public.con_leads TO service_role;
ALTER TABLE public.con_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage leads" ON public.con_leads FOR ALL TO authenticated
  USING (private.is_employee(auth.uid())) WITH CHECK (private.is_employee(auth.uid()));
CREATE TRIGGER con_leads_updated BEFORE UPDATE ON public.con_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.con_lead_won()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE new_est uuid; en text;
BEGIN
  IF new.stage = 'won' AND coalesce(old.stage,'') <> 'won' AND new.estimate_id IS NULL THEN
    en := 'EST-' || to_char(now(),'YY') || '-' || lpad((coalesce((select count(*) from public.con_estimates),0)+1)::text,4,'0');
    INSERT INTO public.con_estimates (estimate_number, title, client_id, status, scope, subtotal, total, estimator_id, created_by)
    VALUES (en, new.title, new.client_id, 'draft', new.notes, coalesce(new.estimated_value,0), coalesce(new.estimated_value,0), new.owner_id, new.created_by)
    RETURNING id INTO new_est;
    new.estimate_id := new_est;
    PERFORM public.notify_user(new.owner_id, 'Lead won', coalesce(new.title,'Lead') || ' — draft estimate ' || en || ' created.', '/estimates');
  END IF;
  RETURN new;
END; $$;
CREATE TRIGGER trg_con_lead_won BEFORE UPDATE ON public.con_leads
  FOR EACH ROW EXECUTE FUNCTION public.con_lead_won();

-- ============ INVOICE LINKAGE ============
ALTER TABLE public.fin_invoices
  ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES public.con_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.con_clients(id) ON DELETE SET NULL;

-- ============ CLIENT PORTAL ============
CREATE TABLE public.con_client_portal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.con_clients(id) ON DELETE CASCADE,
  full_name text,
  email text,
  status text NOT NULL DEFAULT 'active',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_client_portal_users TO authenticated;
GRANT ALL ON public.con_client_portal_users TO service_role;
ALTER TABLE public.con_client_portal_users ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER con_portal_users_updated BEFORE UPDATE ON public.con_client_portal_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION private.portal_client_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT client_id FROM public.con_client_portal_users
  WHERE user_id = _user_id AND status = 'active';
$$;
REVOKE ALL ON FUNCTION private.portal_client_ids(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.portal_client_ids(uuid) TO authenticated, service_role;

CREATE POLICY "Employees manage portal users" ON public.con_client_portal_users FOR ALL TO authenticated
  USING (private.is_employee(auth.uid())) WITH CHECK (private.is_employee(auth.uid()));
CREATE POLICY "Portal user reads own membership" ON public.con_client_portal_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- messages between client + staff
CREATE TABLE public.con_client_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.con_clients(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.con_jobs(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  from_client boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.con_client_messages TO authenticated;
GRANT ALL ON public.con_client_messages TO service_role;
ALTER TABLE public.con_client_messages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER con_client_messages_updated BEFORE UPDATE ON public.con_client_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Employees manage client messages" ON public.con_client_messages FOR ALL TO authenticated
  USING (private.is_employee(auth.uid())) WITH CHECK (private.is_employee(auth.uid()));
CREATE POLICY "Portal reads own messages" ON public.con_client_messages FOR SELECT TO authenticated
  USING (client_id IN (SELECT private.portal_client_ids(auth.uid())));
CREATE POLICY "Portal writes own messages" ON public.con_client_messages FOR INSERT TO authenticated
  WITH CHECK (client_id IN (SELECT private.portal_client_ids(auth.uid())) AND author_id = auth.uid() AND from_client = true);

-- portal read access to their own records
CREATE POLICY "Portal reads own client record" ON public.con_clients FOR SELECT TO authenticated
  USING (id IN (SELECT private.portal_client_ids(auth.uid())));
CREATE POLICY "Portal reads own jobs" ON public.con_jobs FOR SELECT TO authenticated
  USING (client_id IN (SELECT private.portal_client_ids(auth.uid())));
CREATE POLICY "Portal reads own estimates" ON public.con_estimates FOR SELECT TO authenticated
  USING (client_id IN (SELECT private.portal_client_ids(auth.uid())) AND status IN ('sent','approved','rejected'));
CREATE POLICY "Portal reads own invoices" ON public.fin_invoices FOR SELECT TO authenticated
  USING (client_id IN (SELECT private.portal_client_ids(auth.uid())));
CREATE POLICY "Portal reads own change orders" ON public.con_change_orders FOR SELECT TO authenticated
  USING (job_id IN (SELECT id FROM public.con_jobs WHERE client_id IN (SELECT private.portal_client_ids(auth.uid()))));
CREATE POLICY "Portal reads own job documents" ON public.con_documents FOR SELECT TO authenticated
  USING (job_id IN (SELECT id FROM public.con_jobs WHERE client_id IN (SELECT private.portal_client_ids(auth.uid()))));

-- ============ SIGNUP TRIGGER: allow portal accounts ============
CREATE OR REPLACE FUNCTION public.handle_new_hq_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_is_first BOOLEAN;
  v_employee_id uuid;
  v_dept text;
  v_tpl RECORD;
  v_portal_client uuid;
BEGIN
  -- Client portal accounts: no staff invite required.
  v_portal_client := nullif(NEW.raw_user_meta_data->>'portal_client_id','')::uuid;
  IF v_portal_client IS NOT NULL THEN
    INSERT INTO public.con_client_portal_users (user_id, client_id, full_name, email, status)
    VALUES (NEW.id, v_portal_client, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, 'active')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END IF;

  SELECT NOT EXISTS(SELECT 1 FROM public.profiles) INTO v_is_first;

  IF v_is_first THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
    RETURN NEW;
  END IF;

  SELECT * INTO v_invite
  FROM public.invites
  WHERE lower(email) = lower(NEW.email)
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup not allowed: no active invite for %', NEW.email
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, department)
  VALUES (NEW.id, NEW.email, COALESCE(v_invite.full_name, NEW.email), v_invite.department);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_invite.role)
  ON CONFLICT DO NOTHING;

  IF v_invite.role <> 'employee' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee') ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.hr_employees (user_id, full_name, email, department, status, start_date)
  VALUES (NEW.id, COALESCE(v_invite.full_name, NEW.email), NEW.email, v_invite.department, 'active', CURRENT_DATE)
  RETURNING id INTO v_employee_id;

  v_dept := v_invite.department;
  FOR v_tpl IN
    SELECT * FROM public.hr_onboarding_templates
    WHERE department IS NOT DISTINCT FROM v_dept OR department IS NULL
    ORDER BY sort_order
  LOOP
    INSERT INTO public.hr_onboarding (employee_id, task, category, assignee_id, due_date, status)
    VALUES (
      v_employee_id, v_tpl.task, v_tpl.category, NEW.id,
      (CURRENT_DATE + (v_tpl.days_offset || ' days')::interval)::date,
      'pending'
    );
  END LOOP;

  UPDATE public.invites SET accepted_at = now() WHERE id = v_invite.id;

  RETURN NEW;
END;
$function$;