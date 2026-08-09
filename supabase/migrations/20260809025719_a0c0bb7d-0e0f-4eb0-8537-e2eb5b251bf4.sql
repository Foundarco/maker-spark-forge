CREATE TABLE IF NOT EXISTS public.email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  email_address text NOT NULL UNIQUE,
  display_name text,
  imap_host text NOT NULL,
  imap_port integer NOT NULL DEFAULT 993,
  smtp_host text NOT NULL,
  smtp_port integer NOT NULL DEFAULT 465,
  username text NOT NULL,
  is_shared boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_sync_at timestamptz,
  last_sync_error text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_accounts TO authenticated;
GRANT ALL ON public.email_accounts TO service_role;
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage email accounts" ON public.email_accounts;
CREATE POLICY "Admins manage email accounts" ON public.email_accounts FOR ALL TO authenticated
  USING (private.is_hq_admin(auth.uid())) WITH CHECK (private.is_hq_admin(auth.uid()));
DROP POLICY IF EXISTS "Users read their own or shared accounts" ON public.email_accounts;
CREATE POLICY "Users read their own or shared accounts" ON public.email_accounts FOR SELECT TO authenticated
  USING (assigned_user_id = auth.uid() OR is_shared);
DROP TRIGGER IF EXISTS email_accounts_updated_at ON public.email_accounts;
CREATE TRIGGER email_accounts_updated_at BEFORE UPDATE ON public.email_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.email_account_secrets (
  account_id uuid PRIMARY KEY REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  password_ciphertext text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.email_account_secrets TO service_role;
ALTER TABLE public.email_account_secrets ENABLE ROW LEVEL SECURITY;