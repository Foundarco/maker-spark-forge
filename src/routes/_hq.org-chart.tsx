import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Network, Loader2 } from "lucide-react";

type Employee = { id: string; full_name: string; title: string | null; department: string | null; manager_id: string | null; status: string };

export const Route = createFileRoute("/_hq/org-chart")({
  head: () => ({ meta: [{ title: "Org Chart — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: OrgChart,
});

function OrgChart() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from("hr_employees") as any)
      .select("id, full_name, title, department, manager_id, status")
      .eq("status", "active")
      .order("full_name")
      .then(({ data }: any) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  const { roots, byManager } = useMemo(() => {
    const byManager = new Map<string | null, Employee[]>();
    for (const r of rows) {
      const k = r.manager_id ?? null;
      if (!byManager.has(k)) byManager.set(k, []);
      byManager.get(k)!.push(r);
    }
    const ids = new Set(rows.map((r) => r.id));
    const roots = rows.filter((r) => !r.manager_id || !ids.has(r.manager_id));
    return { roots, byManager };
  }, [rows]);

  const byDept = useMemo(() => {
    const m = new Map<string, Employee[]>();
    for (const r of rows) {
      const k = r.department ?? "Unassigned";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    return m;
  }, [rows]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Network className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">HR</p>
          <h1 className="text-3xl font-semibold tracking-tight">Org Chart</h1>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <p className="text-sm">No employees yet. Add people to the directory to see the org chart.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Reporting hierarchy</h2>
            <div className="space-y-1">
              {roots.map((r) => <Node key={r.id} emp={r} byManager={byManager} depth={0} />)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">By department</h2>
            <div className="space-y-3">
              {Array.from(byDept.entries()).sort().map(([dept, list]) => (
                <div key={dept}>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{dept} · {list.length}</p>
                  <ul className="mt-1 space-y-0.5">
                    {list.map((e) => <li key={e.id} className="text-sm">{e.full_name}{e.title ? <span className="text-muted-foreground"> · {e.title}</span> : null}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Node({ emp, byManager, depth }: { emp: Employee; byManager: Map<string | null, Employee[]>; depth: number }) {
  const children = byManager.get(emp.id) ?? [];
  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:bg-muted/30">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {emp.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{emp.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">{emp.title ?? "—"}{emp.department ? ` · ${emp.department}` : ""}</p>
        </div>
      </div>
      {children.length > 0 && (
        <div className="mt-1 space-y-1 border-l border-border pl-3 ml-4">
          {children.map((c) => <Node key={c.id} emp={c} byManager={byManager} depth={0} />)}
        </div>
      )}
    </div>
  );
}
