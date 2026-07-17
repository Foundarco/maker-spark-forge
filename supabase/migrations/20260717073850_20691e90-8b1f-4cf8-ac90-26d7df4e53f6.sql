
CREATE TABLE public.sales_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT,
  contact_name TEXT,
  contact_email TEXT,
  stage TEXT NOT NULL DEFAULT 'lead',
  value NUMERIC(12,2),
  probability INTEGER,
  expected_close DATE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_deals TO authenticated;
GRANT ALL ON public.sales_deals TO service_role;
ALTER TABLE public.sales_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_deals employees" ON public.sales_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER sales_deals_updated BEFORE UPDATE ON public.sales_deals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sales_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'contact',
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_contacts TO authenticated;
GRANT ALL ON public.sales_contacts TO service_role;
ALTER TABLE public.sales_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_contacts employees" ON public.sales_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER sales_contacts_updated BEFORE UPDATE ON public.sales_contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  items_count INTEGER DEFAULT 1,
  subtotal NUMERIC(12,2),
  tax NUMERIC(12,2),
  total NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'pending',
  ordered_at DATE,
  shipped_at DATE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_orders TO authenticated;
GRANT ALL ON public.sales_orders TO service_role;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_orders employees" ON public.sales_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER sales_orders_updated BEFORE UPDATE ON public.sales_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sales_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  party TEXT,
  kind TEXT DEFAULT 'customer',
  value NUMERIC(12,2),
  effective_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_contracts TO authenticated;
GRANT ALL ON public.sales_contracts TO service_role;
ALTER TABLE public.sales_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_contracts employees" ON public.sales_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER sales_contracts_updated BEFORE UPDATE ON public.sales_contracts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sales_price_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  kind TEXT NOT NULL DEFAULT 'discount',
  discount_percent NUMERIC(5,2),
  discount_amount NUMERIC(10,2),
  minimum_quantity INTEGER,
  starts_at DATE,
  ends_at DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_price_rules TO authenticated;
GRANT ALL ON public.sales_price_rules TO service_role;
ALTER TABLE public.sales_price_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_price_rules employees" ON public.sales_price_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER sales_price_rules_updated BEFORE UPDATE ON public.sales_price_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'asset',
  balance NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_accounts TO authenticated;
GRANT ALL ON public.fin_accounts TO service_role;
ALTER TABLE public.fin_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_accounts employees" ON public.fin_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER fin_accounts_updated BEFORE UPDATE ON public.fin_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  memo TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'journal',
  debit_account_id UUID REFERENCES public.fin_accounts(id) ON DELETE SET NULL,
  credit_account_id UUID REFERENCES public.fin_accounts(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL,
  reference TEXT,
  reconciled BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_transactions TO authenticated;
GRANT ALL ON public.fin_transactions TO service_role;
ALTER TABLE public.fin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_transactions employees" ON public.fin_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER fin_transactions_updated BEFORE UPDATE ON public.fin_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fin_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(12,2),
  tax NUMERIC(12,2),
  total NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'draft',
  paid_at DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_invoices TO authenticated;
GRANT ALL ON public.fin_invoices TO service_role;
ALTER TABLE public.fin_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_invoices employees" ON public.fin_invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER fin_invoices_updated BEFORE UPDATE ON public.fin_invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fin_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose TEXT NOT NULL,
  category TEXT,
  amount NUMERIC(12,2) NOT NULL,
  spent_at DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receipt_url TEXT,
  reimbursed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_expenses TO authenticated;
GRANT ALL ON public.fin_expenses TO service_role;
ALTER TABLE public.fin_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_expenses employees" ON public.fin_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER fin_expenses_updated BEFORE UPDATE ON public.fin_expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fin_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT,
  supplier_id UUID REFERENCES public.mfg_suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  amount NUMERIC(12,2) NOT NULL,
  tax NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'open',
  paid_at DATE,
  category TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_bills TO authenticated;
GRANT ALL ON public.fin_bills TO service_role;
ALTER TABLE public.fin_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_bills employees" ON public.fin_bills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER fin_bills_updated BEFORE UPDATE ON public.fin_bills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
