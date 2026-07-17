
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.dev_repos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT,
  url TEXT,
  default_branch TEXT,
  language TEXT,
  visibility TEXT DEFAULT 'private',
  status TEXT DEFAULT 'active',
  description TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dev_repos TO authenticated;
GRANT ALL ON public.dev_repos TO service_role;
ALTER TABLE public.dev_repos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage dev_repos" ON public.dev_repos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.dev_software (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT,
  environment TEXT,
  version TEXT,
  url TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dev_software TO authenticated;
GRANT ALL ON public.dev_software TO service_role;
ALTER TABLE public.dev_software ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage dev_software" ON public.dev_software FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.dev_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vendor TEXT,
  category TEXT,
  status TEXT DEFAULT 'connected',
  connected_at DATE,
  notes TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dev_integrations TO authenticated;
GRANT ALL ON public.dev_integrations TO service_role;
ALTER TABLE public.dev_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage dev_integrations" ON public.dev_integrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.dev_infrastructure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT,
  environment TEXT,
  region TEXT,
  provider TEXT,
  status TEXT DEFAULT 'healthy',
  url TEXT,
  notes TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dev_infrastructure TO authenticated;
GRANT ALL ON public.dev_infrastructure TO service_role;
ALTER TABLE public.dev_infrastructure ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage dev_infrastructure" ON public.dev_infrastructure FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.dev_security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  source TEXT,
  actor_id UUID,
  status TEXT DEFAULT 'open',
  occurred_at TIMESTAMPTZ DEFAULT now(),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dev_security_logs TO authenticated;
GRANT ALL ON public.dev_security_logs TO service_role;
ALTER TABLE public.dev_security_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage dev_security_logs" ON public.dev_security_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER trg_dev_repos_updated BEFORE UPDATE ON public.dev_repos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dev_software_updated BEFORE UPDATE ON public.dev_software FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dev_integrations_updated BEFORE UPDATE ON public.dev_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dev_infrastructure_updated BEFORE UPDATE ON public.dev_infrastructure FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dev_security_logs_updated BEFORE UPDATE ON public.dev_security_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
