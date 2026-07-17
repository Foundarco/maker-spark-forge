
-- 1) Role-based route access
CREATE TABLE IF NOT EXISTS public.role_route_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  route text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, route)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_route_access TO authenticated;
GRANT ALL ON public.role_route_access TO service_role;
ALTER TABLE public.role_route_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_route_access read all" ON public.role_route_access FOR SELECT TO authenticated USING (true);
CREATE POLICY "role_route_access admin write" ON public.role_route_access FOR ALL TO authenticated
  USING (public.has_role_permission(auth.uid(), 'manage_roles'))
  WITH CHECK (public.has_role_permission(auth.uid(), 'manage_roles'));

-- 2) Onboarding templates per department
CREATE TABLE IF NOT EXISTS public.hr_onboarding_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department text,
  task text NOT NULL,
  category text,
  days_offset integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_onboarding_templates TO authenticated;
GRANT ALL ON public.hr_onboarding_templates TO service_role;
ALTER TABLE public.hr_onboarding_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onboarding_templates all authed" ON public.hr_onboarding_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_onboarding_templates_updated_at BEFORE UPDATE ON public.hr_onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) Suspensions
CREATE TABLE IF NOT EXISTS public.hr_suspensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  reason text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_suspensions TO authenticated;
GRANT ALL ON public.hr_suspensions TO service_role;
ALTER TABLE public.hr_suspensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suspensions all authed" ON public.hr_suspensions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hr_suspensions_updated_at BEFORE UPDATE ON public.hr_suspensions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS hr_suspensions_active_idx ON public.hr_suspensions (user_id) WHERE active;

-- 4) Route access helper
CREATE OR REPLACE FUNCTION public.has_route_access(_user_id uuid, _route text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    -- super_admin/admin always
    EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin'))
    OR
    -- any custom role with admin permission
    EXISTS(SELECT 1 FROM public.user_custom_roles ucr
           JOIN public.custom_roles cr ON cr.id = ucr.role_id
           WHERE ucr.user_id = _user_id AND COALESCE((cr.permissions->>'admin')::boolean, false))
    OR
    -- explicit grant
    EXISTS(SELECT 1 FROM public.user_custom_roles ucr
           JOIN public.role_route_access rra ON rra.role_id = ucr.role_id
           WHERE ucr.user_id = _user_id AND rra.route = _route)
    OR
    -- no custom roles at all → default: allow (backwards compatible)
    NOT EXISTS(SELECT 1 FROM public.user_custom_roles WHERE user_id = _user_id)
$$;

-- 5) Suspension check
CREATE OR REPLACE FUNCTION public.is_suspended(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.hr_suspensions
    WHERE user_id = _user_id AND active
      AND starts_at <= now()
      AND (ends_at IS NULL OR ends_at > now())
  )
$$;

-- 6) Update handle_new_hq_user to seed onboarding tasks
CREATE OR REPLACE FUNCTION public.handle_new_hq_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_is_first BOOLEAN;
  v_employee_id uuid;
  v_dept text;
  v_tpl RECORD;
BEGIN
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

  -- Create hr_employees row
  INSERT INTO public.hr_employees (user_id, full_name, email, department, status, start_date)
  VALUES (NEW.id, COALESCE(v_invite.full_name, NEW.email), NEW.email, v_invite.department, 'active', CURRENT_DATE)
  RETURNING id INTO v_employee_id;

  -- Seed onboarding tasks from department template (or NULL/global fallback)
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
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created_hq ON auth.users;
CREATE TRIGGER on_auth_user_created_hq
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_hq_user();

-- 7) Auto-log time entries when a meeting ends
CREATE OR REPLACE FUNCTION public.log_meeting_time_entries()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_hours numeric;
  v_date date;
BEGIN
  IF NEW.ended_at IS NULL OR OLD.ended_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_hours := GREATEST(ROUND(EXTRACT(EPOCH FROM (NEW.ended_at - NEW.starts_at)) / 3600.0, 2), 0.05);
  v_date := (NEW.starts_at AT TIME ZONE 'UTC')::date;

  -- Log for host
  INSERT INTO public.hr_time_entries (user_id, entry_date, hours, project, task, notes, billable, created_by)
  VALUES (NEW.host_id, v_date, v_hours, 'Meetings', NEW.title, 'Auto-logged: meeting host', false, NEW.host_id)
  ON CONFLICT DO NOTHING;

  -- Log for each participant with RSVP != 'no'
  INSERT INTO public.hr_time_entries (user_id, entry_date, hours, project, task, notes, billable, created_by)
  SELECT mp.user_id, v_date, v_hours, 'Meetings', NEW.title, 'Auto-logged: meeting attendee', false, NEW.host_id
  FROM public.meeting_participants mp
  WHERE mp.meeting_id = NEW.id
    AND mp.rsvp <> 'no'
    AND mp.user_id <> NEW.host_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS meetings_auto_time_log ON public.meetings;
CREATE TRIGGER meetings_auto_time_log
AFTER UPDATE OF ended_at ON public.meetings
FOR EACH ROW EXECUTE FUNCTION public.log_meeting_time_entries();

-- 8) Seed some default onboarding templates (idempotent-ish)
INSERT INTO public.hr_onboarding_templates (department, task, category, days_offset, sort_order)
SELECT * FROM (VALUES
  (NULL, 'Sign employee handbook', 'Paperwork', 0, 1),
  (NULL, 'Set up HQ account & MFA', 'Access', 0, 2),
  (NULL, 'Complete IT equipment checkout', 'Equipment', 1, 3),
  (NULL, 'Meet with manager (1:1)', 'Intro', 2, 4),
  (NULL, 'Complete benefits enrollment', 'Benefits', 7, 5),
  (NULL, 'Complete security training', 'Training', 5, 6),
  ('Engineering', 'Clone core repos & run local build', 'Training', 2, 10),
  ('Engineering', 'Pair with a senior engineer', 'Intro', 3, 11),
  ('Sales', 'Complete CRM training', 'Training', 2, 10),
  ('Manufacturing', 'Shop floor safety walkthrough', 'Training', 0, 10)
) AS v(department, task, category, days_offset, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.hr_onboarding_templates LIMIT 1);
