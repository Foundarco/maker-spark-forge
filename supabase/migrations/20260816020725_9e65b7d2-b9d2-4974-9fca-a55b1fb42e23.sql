ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_step smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Public (pre-auth) invite check used by the onboarding wizard
CREATE OR REPLACE FUNCTION public.onboarding_invite_check(_email text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object('ok', true, 'full_name', i.full_name, 'department', i.department)
       FROM public.invites i
      WHERE lower(i.email) = lower(trim(_email))
        AND i.accepted_at IS NULL
        AND i.expires_at > now()
      ORDER BY i.created_at DESC
      LIMIT 1),
    (SELECT jsonb_build_object('ok', true, 'existing', true, 'full_name', p.full_name)
       FROM public.profiles p
      WHERE lower(p.email) = lower(trim(_email))
      LIMIT 1),
    jsonb_build_object('ok', false)
  );
$$;

GRANT EXECUTE ON FUNCTION public.onboarding_invite_check(text) TO anon, authenticated;

-- Directory add -> automatic invite
CREATE OR REPLACE FUNCTION public.hr_employee_auto_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR trim(NEW.email) = '' OR NEW.user_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles p WHERE lower(p.email) = lower(NEW.email)) THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.invites i
     WHERE lower(i.email) = lower(NEW.email)
       AND i.accepted_at IS NULL
       AND i.expires_at > now()
  ) THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.invites (email, role, department, full_name, invited_by)
  VALUES (lower(trim(NEW.email)), 'employee', NEW.department, NEW.full_name, auth.uid());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hr_employee_auto_invite ON public.hr_employees;
CREATE TRIGGER trg_hr_employee_auto_invite
AFTER INSERT ON public.hr_employees
FOR EACH ROW EXECUTE FUNCTION public.hr_employee_auto_invite();

-- Link the new account to an existing directory record instead of duplicating it
CREATE OR REPLACE FUNCTION public.handle_new_hq_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_is_first BOOLEAN;
  v_employee_id uuid;
  v_dept text;
  v_tpl RECORD;
  v_portal_client uuid;
BEGIN
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

  SELECT id INTO v_employee_id
  FROM public.hr_employees
  WHERE lower(email) = lower(NEW.email)
  ORDER BY created_at
  LIMIT 1;

  IF v_employee_id IS NULL THEN
    INSERT INTO public.hr_employees (user_id, full_name, email, department, status, start_date)
    VALUES (NEW.id, COALESCE(v_invite.full_name, NEW.email), NEW.email, v_invite.department, 'active', CURRENT_DATE)
    RETURNING id INTO v_employee_id;
  ELSE
    UPDATE public.hr_employees
       SET user_id = NEW.id,
           department = COALESCE(department, v_invite.department)
     WHERE id = v_employee_id;
  END IF;

  v_dept := COALESCE(v_invite.department, (SELECT department FROM public.hr_employees WHERE id = v_employee_id));

  IF NOT EXISTS (SELECT 1 FROM public.hr_onboarding WHERE employee_id = v_employee_id) THEN
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
  ELSE
    UPDATE public.hr_onboarding SET assignee_id = COALESCE(assignee_id, NEW.id) WHERE employee_id = v_employee_id;
  END IF;

  UPDATE public.invites SET accepted_at = now() WHERE id = v_invite.id;

  RETURN NEW;
END;
$$;

-- Avatar storage rules
DROP POLICY IF EXISTS "avatars readable by staff" ON storage.objects;
CREATE POLICY "avatars readable by staff" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars insert own" ON storage.objects;
CREATE POLICY "avatars insert own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars update own" ON storage.objects;
CREATE POLICY "avatars update own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars delete own" ON storage.objects;
CREATE POLICY "avatars delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);