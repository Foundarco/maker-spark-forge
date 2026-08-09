import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HardHat } from "lucide-react";

export const Route = createFileRoute("/client-login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Client Portal Sign In — McGuire Construction" },
      { name: "description", content: "Sign in to the McGuire Construction client portal to track your project, documents and invoices." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Client Portal Sign In — McGuire Construction" },
      { property: "og:description", content: "Track your project, documents and invoices." },
    ],
  }),
  component: ClientLogin,
});

function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: m } = await supabase
          .from("con_client_portal_users")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .maybeSingle();
        if (m) navigate({ to: "/portal" });
      }
    })();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: m } = await supabase
        .from("con_client_portal_users")
        .select("id")
        .eq("user_id", data.user!.id)
        .eq("status", "active")
        .maybeSingle();
      if (!m) {
        await supabase.auth.signOut();
        throw new Error("This account does not have client portal access.");
      }
      navigate({ to: "/portal" });
    } catch (err: any) {
      setError(err?.message ?? "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">Client Portal</p>
            <p className="text-xs text-muted-foreground">McGuire Construction</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your project progress, documents, change orders and invoices.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                aria-label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                aria-label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need access? Ask your project manager to invite you.
        </p>
      </div>
    </div>
  );
}
