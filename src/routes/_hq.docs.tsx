import { createFileRoute } from "@tanstack/react-router";
import { BookText, Search, FileText, User, Clock, Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_hq/docs")({
  head: () => ({ meta: [{ title: "Documentation — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: DocsPage,
});

type Doc = {
  id: string;
  title: string;
  space: "Product" | "Firmware" | "Manufacturing" | "Onboarding" | "Runbooks";
  author: string;
  updated: string;
  views: number;
  starred: boolean;
  summary: string;
};

const DOCS: Doc[] = [
  { id: "D-001", title: "Clovr One · Product Requirements Document", space: "Product", author: "K. Chen", updated: "1d", views: 214, starred: true, summary: "PRD covering print volume, chamber, motion, firmware, warranty, price target." },
  { id: "D-002", title: "Firmware 2.5 · Architecture Overview", space: "Firmware", author: "S. Nguyen", updated: "3h", views: 88, starred: true, summary: "Task model, IPC, safety-critical paths, input-shaping pipeline, OTA channel." },
  { id: "D-003", title: "Hotend V4 · Assembly SOP", space: "Manufacturing", author: "M. Rossi", updated: "2d", views: 142, starred: false, summary: "Step-by-step assembly with torque specs, thermal paste application, first-boot check." },
  { id: "D-004", title: "Onboarding · Engineering", space: "Onboarding", author: "L. Berger", updated: "1w", views: 402, starred: true, summary: "First 30 days: tooling access, CAD workflow, code review norms, gate reviews." },
  { id: "D-005", title: "Runbook · Line B stopped", space: "Runbooks", author: "J. Alvarez", updated: "5d", views: 33, starred: false, summary: "Escalation ladder, station-by-station diagnosis tree, safe-mode reset." },
  { id: "D-006", title: "Cloud API · REST reference", space: "Product", author: "L. Berger", updated: "6h", views: 71, starred: false, summary: "Print farm control, telemetry ingestion, auth, rate limits, error semantics." },
  { id: "D-007", title: "Slicer profile authoring guide", space: "Product", author: "R. Owens", updated: "4d", views: 45, starred: false, summary: "How to build a profile from scratch, calibration workflow, sharing via cloud." },
  { id: "D-008", title: "Safety · Electrical bring-up procedure", space: "Runbooks", author: "D. Patel", updated: "2w", views: 60, starred: true, summary: "Isolation, dielectric hi-pot, leakage current, PE bond check, sign-off." },
];

const SPACES: (Doc["space"] | "All")[] = ["All", "Product", "Firmware", "Manufacturing", "Onboarding", "Runbooks"];

function DocsPage() {
  const [q, setQ] = useState("");
  const [space, setSpace] = useState<Doc["space"] | "All">("All");
  const filtered = DOCS.filter((d) =>
    (space === "All" || d.space === space) &&
    (!q || d.title.toLowerCase().includes(q.toLowerCase()) || d.summary.toLowerCase().includes(q.toLowerCase())),
  );
  const starred = filtered.filter((d) => d.starred);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><BookText className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · Docs</p>
          <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search docs…" className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1 text-xs">
          {SPACES.map((s) => (
            <button key={s} onClick={() => setSpace(s)} className={`rounded-md px-2 py-1 transition ${space === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{s}</button>
          ))}
        </div>
      </div>

      {starred.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Star className="h-3 w-3" /> Starred</p>
          <div className="grid gap-2 md:grid-cols-2">
            {starred.map((d) => <DocRow key={d.id} d={d} />)}
          </div>
        </div>
      )}

      <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><FileText className="h-3 w-3" /> All documents</p>
      <div className="grid gap-2 md:grid-cols-2">
        {filtered.map((d) => <DocRow key={d.id} d={d} />)}
      </div>
      {filtered.length === 0 && <p className="mt-6 text-center text-sm text-muted-foreground">No documents match.</p>}
    </div>
  );
}

function DocRow({ d }: { d: Doc }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{d.space} · {d.id}</p>
          <p className="mt-0.5 font-medium">{d.title}</p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.summary}</p>
        </div>
        {d.starred && <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-500 text-yellow-500" />}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {d.author}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {d.updated} ago</span>
        <span>{d.views} views</span>
      </div>
    </div>
  );
}
