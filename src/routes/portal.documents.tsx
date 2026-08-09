import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, FileText } from "lucide-react";
import { Panel, Empty } from "./portal.index";

type Row = Record<string, any>;
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

function PortalDocuments() {
  const { portal } = Route.useRouteContext();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: jobs } = await supabase.from("con_jobs").select("id, name").eq("client_id", portal.clientId);
      const ids = (jobs ?? []).map((j: any) => j.id);
      const names = new Map((jobs ?? []).map((j: any) => [j.id, j.name]));
      const { data } = ids.length
        ? await supabase.from("con_documents").select("*").in("job_id", ids).order("created_at", { ascending: false })
        : { data: [] as Row[] };
      if (!alive) return;
      setRows((data ?? []).map((d: any) => ({ ...d, job_name: names.get(d.job_id) })));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [portal.clientId]);

  const open = async (row: Row) => {
    if (!row.storage_path) return;
    const { data } = await supabase.storage.from("drive").createSignedUrl(row.storage_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Plans, permits, contracts and photos shared with you.</p>
      </header>

      <Panel title="Shared with you">
        {rows.length === 0 ? <Empty text="No documents shared yet." /> : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.name ?? r.title ?? "Document"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {[r.category, r.job_name, fmt(r.created_at)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                {r.storage_path && (
                  <button onClick={() => open(r)} aria-label={`Download ${r.name ?? "document"}`} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted">
                    <Download className="h-3.5 w-3.5" /> Open
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export const Route = createFileRoute("/portal/documents")({
  head: () => ({ meta: [{ title: "Documents — Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: PortalDocuments,
});
