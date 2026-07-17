
-- Support tickets (covers tickets, email support, live chat, phone logs via `channel`)
CREATE TABLE public.cs_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  channel TEXT NOT NULL DEFAULT 'web',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cs_tickets TO authenticated;
GRANT ALL ON public.cs_tickets TO service_role;
ALTER TABLE public.cs_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_tickets employees" ON public.cs_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER cs_tickets_updated BEFORE UPDATE ON public.cs_tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- KB articles (kb + faq)
CREATE TABLE public.cs_kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'kb',
  title TEXT NOT NULL,
  body TEXT,
  category TEXT,
  audience TEXT NOT NULL DEFAULT 'internal',
  published BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cs_kb_articles TO authenticated;
GRANT ALL ON public.cs_kb_articles TO service_role;
ALTER TABLE public.cs_kb_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_kb employees" ON public.cs_kb_articles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER cs_kb_updated BEFORE UPDATE ON public.cs_kb_articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CSAT
CREATE TABLE public.cs_csat_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.cs_tickets(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  score INTEGER NOT NULL,
  nps INTEGER,
  comment TEXT,
  source TEXT DEFAULT 'email',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cs_csat_responses TO authenticated;
GRANT ALL ON public.cs_csat_responses TO service_role;
ALTER TABLE public.cs_csat_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_csat employees" ON public.cs_csat_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER cs_csat_updated BEFORE UPDATE ON public.cs_csat_responses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Repairs
CREATE TABLE public.cs_repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  product_name TEXT NOT NULL,
  serial_number TEXT,
  issue TEXT,
  status TEXT NOT NULL DEFAULT 'intake',
  technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  received_at DATE,
  shipped_back_at DATE,
  cost NUMERIC(10,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cs_repairs TO authenticated;
GRANT ALL ON public.cs_repairs TO service_role;
ALTER TABLE public.cs_repairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_repairs employees" ON public.cs_repairs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER cs_repairs_updated BEFORE UPDATE ON public.cs_repairs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RMAs
CREATE TABLE public.cs_rmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rma_number TEXT,
  order_reference TEXT,
  customer_name TEXT,
  customer_email TEXT,
  product_name TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  refund_amount NUMERIC(10,2),
  received_at DATE,
  resolved_at DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cs_rmas TO authenticated;
GRANT ALL ON public.cs_rmas TO service_role;
ALTER TABLE public.cs_rmas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_rmas employees" ON public.cs_rmas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER cs_rmas_updated BEFORE UPDATE ON public.cs_rmas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Warranty claims
CREATE TABLE public.cs_warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  product_name TEXT NOT NULL,
  serial_number TEXT,
  purchase_date DATE,
  issue TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  resolution TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cs_warranty_claims TO authenticated;
GRANT ALL ON public.cs_warranty_claims TO service_role;
ALTER TABLE public.cs_warranty_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_warranty employees" ON public.cs_warranty_claims FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER cs_warranty_updated BEFORE UPDATE ON public.cs_warranty_claims FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
