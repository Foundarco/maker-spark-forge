-- helper: notify a user
create or replace function public.notify_user(_user_id uuid, _title text, _body text, _link text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _user_id is null then return; end if;
  insert into public.notifications (user_id, title, body, link) values (_user_id, _title, _body, _link);
end; $$;

create or replace function public.notify_managers(_title text, _body text, _link text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, title, body, link)
  select distinct ur.user_id, _title, _body, _link
  from public.user_roles ur
  where ur.role in ('super_admin','admin','manager');
end; $$;

-- 1. Estimate approved -> create job
create or replace function public.con_estimate_approved()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_job uuid; jn text;
begin
  if new.status = 'approved' and coalesce(old.status,'') <> 'approved' then
    if new.job_id is null then
      jn := 'J-' || to_char(now(), 'YY') || '-' || lpad((coalesce((select count(*) from public.con_jobs), 0) + 1)::text, 4, '0');
      insert into public.con_jobs (job_number, name, client_id, stage, status, contract_value, estimated_cost, start_date, created_by)
      values (jn, coalesce(new.title, 'New job'), new.client_id, 'contract', 'active', coalesce(new.total, 0), coalesce(new.subtotal, 0), current_date, new.created_by)
      returning id into new_job;
      new.job_id := new_job;
      insert into public.con_tasks (title, description, entity_type, entity_id, job_id, department, status, priority, due_date, created_by)
      values ('Kickoff: ' || coalesce(new.title,'job'), 'Estimate approved. Schedule kickoff, permits and crew.', 'job', new_job, new_job, 'project_management', 'open', 'high', current_date + 3, new.created_by);
    end if;
    new.approved_at := coalesce(new.approved_at, now());
    perform public.notify_user(new.estimator_id, 'Estimate approved', coalesce(new.title,'Estimate') || ' was approved. Job created.', '/jobs');
    insert into public.con_audit_log (actor_id, action, entity_type, entity_id, summary)
    values (auth.uid(), 'approved', 'estimate', new.id, 'Estimate approved and job created');
  end if;
  return new;
end; $$;
drop trigger if exists trg_con_estimate_approved on public.con_estimates;
create trigger trg_con_estimate_approved before update on public.con_estimates
for each row execute function public.con_estimate_approved();

-- 2. Daily log submitted -> time entry
create or replace function public.con_daily_log_submitted()
returns trigger language plpgsql security definer set search_path = public as $$
declare job_name text;
begin
  if new.status in ('submitted','approved') and (tg_op = 'INSERT' or coalesce(old.status,'') not in ('submitted','approved')) then
    select name into job_name from public.con_jobs where id = new.job_id;
    if new.submitted_by is not null and coalesce(new.hours_worked,0) > 0 then
      insert into public.hr_time_entries (user_id, entry_date, hours, project, task, notes, billable, created_by)
      values (new.submitted_by, new.log_date, new.hours_worked, coalesce(job_name,'Job'), 'Field work', left(coalesce(new.work_performed,''), 500), true, new.submitted_by);
    end if;
    if new.delays is not null and length(trim(new.delays)) > 0 then
      insert into public.con_tasks (title, description, entity_type, entity_id, job_id, department, status, priority, created_by)
      values ('Resolve delay on ' || coalesce(job_name,'job'), new.delays, 'job', new.job_id, new.job_id, 'operations', 'open', 'high', new.submitted_by);
      perform public.notify_managers('Delay reported', coalesce(job_name,'A job') || ': ' || left(new.delays, 200), '/daily-logs');
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_con_daily_log_submitted on public.con_daily_logs;
create trigger trg_con_daily_log_submitted after insert or update on public.con_daily_logs
for each row execute function public.con_daily_log_submitted();

-- 3. Change order approved -> contract value
create or replace function public.con_change_order_approved()
returns trigger language plpgsql security definer set search_path = public as $$
declare j record;
begin
  if new.status = 'approved' and coalesce(old.status,'') <> 'approved' then
    select * into j from public.con_jobs where id = new.job_id;
    if found then
      update public.con_jobs
        set contract_value = coalesce(contract_value,0) + coalesce(new.cost_delta,0),
            target_end_date = case when new.days_delta is not null and target_end_date is not null
                                   then target_end_date + new.days_delta else target_end_date end
      where id = new.job_id;
      insert into public.con_audit_log (actor_id, action, entity_type, entity_id, field, old_value, new_value, summary)
      values (auth.uid(), 'approved', 'change_order', new.id, 'contract_value', coalesce(j.contract_value,0)::text,
              (coalesce(j.contract_value,0) + coalesce(new.cost_delta,0))::text,
              'Change order ' || coalesce(new.co_number,'') || ' approved');
      perform public.notify_user(j.project_manager_id, 'Change order approved',
        coalesce(new.title,'Change order') || ' — contract updated by ' || coalesce(new.cost_delta,0)::text, '/change-orders');
    end if;
    new.approved_at := coalesce(new.approved_at, now());
  end if;
  return new;
end; $$;
drop trigger if exists trg_con_change_order_approved on public.con_change_orders;
create trigger trg_con_change_order_approved before update on public.con_change_orders
for each row execute function public.con_change_order_approved();

-- 4. Safety incident -> corrective task + notify
create or replace function public.con_incident_created()
returns trigger language plpgsql security definer set search_path = public as $$
declare job_name text;
begin
  select name into job_name from public.con_jobs where id = new.job_id;
  insert into public.con_tasks (title, description, entity_type, entity_id, job_id, department, status, priority, due_date, created_by)
  values ('Corrective action: ' || coalesce(new.incident_type,'incident'),
          left(coalesce(new.description,''), 1000), 'safety_incident', new.id, new.job_id, 'safety', 'open',
          case when new.severity in ('critical','major') or new.osha_reportable then 'urgent' else 'high' end,
          current_date + 2, new.reported_by);
  perform public.notify_managers('Safety incident reported',
    coalesce(new.incident_type,'Incident') || ' at ' || coalesce(job_name,'a job') ||
    case when new.osha_reportable then ' (OSHA reportable)' else '' end, '/safety');
  return new;
end; $$;
drop trigger if exists trg_con_incident_created on public.con_safety_incidents;
create trigger trg_con_incident_created after insert on public.con_safety_incidents
for each row execute function public.con_incident_created();

-- 5. Equipment service threshold -> maintenance task
create or replace function public.con_equipment_service_check()
returns trigger language plpgsql security definer set search_path = public as $$
declare due boolean := false;
begin
  if new.next_service_date is not null and new.next_service_date <= current_date + 7 then due := true; end if;
  if new.next_service_hours is not null and coalesce(new.hours_meter,0) >= new.next_service_hours then due := true; end if;
  if due and not exists (
    select 1 from public.con_tasks
    where entity_type = 'equipment' and entity_id = new.id and status in ('open','in_progress')
  ) then
    insert into public.con_tasks (title, description, entity_type, entity_id, job_id, department, status, priority, due_date)
    values ('Service due: ' || new.name, 'Equipment has reached its service threshold.', 'equipment', new.id, new.job_id,
            'operations', 'open', 'high', coalesce(new.next_service_date, current_date + 3));
    perform public.notify_managers('Equipment service due', new.name || ' needs maintenance.', '/equipment');
  end if;
  return new;
end; $$;
drop trigger if exists trg_con_equipment_service on public.con_equipment;
create trigger trg_con_equipment_service after insert or update on public.con_equipment
for each row execute function public.con_equipment_service_check();

-- 6. Applicant hired -> employee + onboarding
create or replace function public.hr_applicant_hired()
returns trigger language plpgsql security definer set search_path = public as $$
declare emp uuid;
begin
  if new.stage = 'hired' and coalesce(old.stage,'') <> 'hired' then
    if not exists (select 1 from public.hr_employees where email = new.email) then
      insert into public.hr_employees (full_name, email, phone, title, department, employment_type, start_date, status, created_by)
      values (new.name, new.email, new.phone, new.role, new.department, 'full_time', current_date + 14, 'onboarding', new.created_by)
      returning id into emp;

      insert into public.hr_onboarding (employee_id, task, category, due_date, status, created_by)
      select emp, t.task, t.category, current_date + t.offset_days, 'pending', new.created_by
      from (values
        ('Send offer letter and collect signature', 'paperwork', 1),
        ('Collect W-4, I-9 and direct deposit', 'paperwork', 3),
        ('Create HQ account and email', 'it', 5),
        ('Issue PPE and safety orientation', 'safety', 10),
        ('OSHA 10 / site safety training', 'training', 14),
        ('Assign crew and foreman introduction', 'operations', 14),
        ('Review employee handbook and policies', 'hr', 16)
      ) as t(task, category, offset_days);

      perform public.notify_managers('New hire started onboarding', new.name || ' was marked hired. Onboarding checklist created.', '/onboarding');
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_hr_applicant_hired on public.hr_applicants;
create trigger trg_hr_applicant_hired after update on public.hr_applicants
for each row execute function public.hr_applicant_hired();

-- 7. Assignment notifications
create or replace function public.con_task_assigned()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assignee_id is not null and (tg_op = 'INSERT' or coalesce(old.assignee_id::text,'') <> new.assignee_id::text) then
    perform public.notify_user(new.assignee_id, 'New task assigned', new.title, '/company-tasks');
  end if;
  return new;
end; $$;
drop trigger if exists trg_con_task_assigned on public.con_tasks;
create trigger trg_con_task_assigned after insert or update on public.con_tasks
for each row execute function public.con_task_assigned();

create or replace function public.con_punch_assigned()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assignee_id is not null and (tg_op = 'INSERT' or coalesce(old.assignee_id::text,'') <> new.assignee_id::text) then
    perform public.notify_user(new.assignee_id, 'Punch item assigned', new.title, '/punch-list');
  end if;
  return new;
end; $$;
drop trigger if exists trg_con_punch_assigned on public.con_punch_items;
create trigger trg_con_punch_assigned after insert or update on public.con_punch_items
for each row execute function public.con_punch_assigned();

create or replace function public.con_submittal_ball_in_court()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.ball_in_court is not null and (tg_op = 'INSERT' or coalesce(old.ball_in_court::text,'') <> new.ball_in_court::text) then
    perform public.notify_user(new.ball_in_court, coalesce(initcap(new.kind),'RFI') || ' needs your response', coalesce(new.title, new.number, ''), '/rfis');
  end if;
  return new;
end; $$;
drop trigger if exists trg_con_submittal_bic on public.con_submittals;
create trigger trg_con_submittal_bic after insert or update on public.con_submittals
for each row execute function public.con_submittal_ball_in_court();

-- 8. Job stage audit
create or replace function public.con_job_audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(old.stage,'') <> coalesce(new.stage,'') then
    insert into public.con_audit_log (actor_id, action, entity_type, entity_id, field, old_value, new_value, summary)
    values (auth.uid(), 'stage_change', 'job', new.id, 'stage', old.stage, new.stage, new.name || ' moved to ' || coalesce(new.stage,'—'));
    perform public.notify_user(new.project_manager_id, 'Job stage updated', new.name || ' → ' || coalesce(new.stage,'—'), '/jobs');
  end if;
  if coalesce(old.contract_value,0) <> coalesce(new.contract_value,0) then
    insert into public.con_audit_log (actor_id, action, entity_type, entity_id, field, old_value, new_value, summary)
    values (auth.uid(), 'update', 'job', new.id, 'contract_value', coalesce(old.contract_value,0)::text, coalesce(new.contract_value,0)::text, new.name || ' contract value changed');
  end if;
  return new;
end; $$;
drop trigger if exists trg_con_job_audit on public.con_jobs;
create trigger trg_con_job_audit after update on public.con_jobs
for each row execute function public.con_job_audit();