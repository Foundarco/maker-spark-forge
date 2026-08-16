import { useCurrentApp } from "@/lib/hq/app-context";
import { appUrl } from "@/lib/hq/apps";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ArrowUpRight, LogOut } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Blocks entry to a team app the signed-in user has no role in.
 * Everything inside a permitted app renders normally.
 */
export function AppGate({ children }: { children: ReactNode }) {
  const { loading, app, denied, unknown, permitted, slug } = useCurrentApp();

  if (loading || (!denied && !unknown)) return <>{children}</>;

  const title = unknown
    ? `No workspace at “${slug}”`
    : !app?.enabled
      ? `${app?.label ?? "This workspace"} isn’t live yet`
      : `You don’t have access to ${app?.label}`;

  const body = unknown
    ? "This subdomain isn’t linked to a workspace. Pick one of your workspaces below."
    : !app?.enabled
      ? "An administrator has this workspace turned off. It will appear here once it goes live."
      : "Your role isn’t part of this team. Ask an administrator for access, or open one of your workspaces.";

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-surface p-6 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>

        {permitted.length > 0 && (
          <div className="mt-6 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your workspaces</p>
            {permitted.map((a) => (
              <a
                key={a.id}
                href={appUrl(a)}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-muted"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{a.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{a.tagline || a.subdomain}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}

        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/hq-login"; }}
          className="mt-6 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  );
}
