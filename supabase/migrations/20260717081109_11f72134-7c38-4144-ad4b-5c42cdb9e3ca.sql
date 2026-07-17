
-- EMAILS
CREATE TABLE public.hq_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder TEXT NOT NULL DEFAULT 'inbox',
  mailbox TEXT NOT NULL DEFAULT 'personal',
  subject TEXT NOT NULL,
  from_addr TEXT,
  to_addr TEXT,
  cc TEXT,
  bcc TEXT,
  body TEXT,
  status TEXT DEFAULT 'unread',
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hq_emails TO authenticated;
GRANT ALL ON public.hq_emails TO service_role;
ALTER TABLE public.hq_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage emails" ON public.hq_emails FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hq_emails_updated_at BEFORE UPDATE ON public.hq_emails FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hq_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  subject TEXT NOT NULL,
  body TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hq_email_templates TO authenticated;
GRANT ALL ON public.hq_email_templates TO service_role;
ALTER TABLE public.hq_email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage email templates" ON public.hq_email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hq_email_templates_updated_at BEFORE UPDATE ON public.hq_email_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hq_email_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  match_field TEXT NOT NULL DEFAULT 'from_addr',
  match_value TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'label',
  action_value TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hq_email_rules TO authenticated;
GRANT ALL ON public.hq_email_rules TO service_role;
ALTER TABLE public.hq_email_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage email rules" ON public.hq_email_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hq_email_rules_updated_at BEFORE UPDATE ON public.hq_email_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FILES
CREATE TABLE public.hq_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  path TEXT,
  folder TEXT DEFAULT '/',
  size_bytes BIGINT DEFAULT 0,
  mime_type TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_shared BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES public.hq_files(id) ON DELETE SET NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hq_files TO authenticated;
GRANT ALL ON public.hq_files TO service_role;
ALTER TABLE public.hq_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage files" ON public.hq_files FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hq_files_updated_at BEFORE UPDATE ON public.hq_files FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hq_file_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES public.hq_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'view',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hq_file_permissions TO authenticated;
GRANT ALL ON public.hq_file_permissions TO service_role;
ALTER TABLE public.hq_file_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees manage file permissions" ON public.hq_file_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER hq_file_permissions_updated_at BEFORE UPDATE ON public.hq_file_permissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
