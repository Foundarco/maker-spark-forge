import { createFileRoute } from "@tanstack/react-router";
import { Bug, AlertOctagon, AlertTriangle, Info, User, Clock, MessageSquare } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_hq/issues")({
  head: () => ({ meta: [{ title: "Issues — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: IssuesPage,
});

type Severity = "sev-1" | "sev-2" | "sev-3";
type State = "open" | "triaged" | "in-progress" | "resolved" | "closed";
type Issue = {
  id: string;
  title: string;
  severity: Severity;
  state: State;
  category: "Mechanical" | "Electrical" | "Firmware" | "Software" | "Manufacturing" | "Quality";
  reporter: string;
  assignee: string;
  project: string;
  comments: number;
  age: string;
};

const ISSUES: Issue[] = [
  { id: "ISS-482", title: "Layer shift after 6h prints (Line A)", severity: "sev-1", state: "in-progress", category: "Motion" as any, reporter: "M. Rossi", assignee: "K. Chen", project: "CLV-ONE-R2", comments: 14, age: "2h" },
  { id: "ISS-481", title: "USB-C PD renegotiates under load", severity: "sev-1", state: "triaged", category: "Electrical", reporter: "L. Berger", assignee: "J. Alvarez", project: "CLV-ONE-R2", comments: 6, age: "5h" },
  { id: "ISS-480", title: "Klipper crash on aggressive input shaping", severity: "sev-2", state: "in-progress", category: "Firmware", reporter: "S. Nguyen", assignee: "S. Nguyen", project: "CLV-FW-2.5", comments: 9, age: "1d" },
  { id: "ISS-479", title: "HEPA fan tach reads zero at low duty", severity: "sev-2", state: "open", category: "Electrical", reporter: "D. Patel", assignee: "D. Patel", project: "CLV-PRO", comments: 2, age: "1d" },
  { id: "ISS-478", title: "Slicer crash on models >500MB", severity: "sev-2", state: "triaged", category: "Software", reporter: "R. Owens", assignee: "R. Owens", project: "CLV-SLICER", comments: 4, age: "2d" },
  { id: "ISS-477", title: "Bed corners overshoot 5°C", severity: "sev-3", state: "in-progress", category: "Mechanical", reporter: "K. Chen", assignee: "M. Rossi", project: "CLV-ONE-R2", comments: 3, age: "3d" },
  { id: "ISS-476", title: "PPAP paperwork missing for LDO motors", severity: "sev-3", state: "open", category: "Manufacturing", reporter: "J. Alvarez", assignee: "D. Patel", project: "CLV-ONE-R2", comments: 1, age: "3d" },
  { id: "ISS-475", title: "Documentation typo in bring-up guide", severity: "sev-3", state: "resolved", category: "Quality", reporter: "L. Berger", assignee: "L. Berger", project: "CLV-ONE-R2", comments: 0, age: "5d" },
];

const SEV_META = {
  "sev-1": { cls: "border-destructive/30 bg-destructive/10 text-destructive", icon: AlertOctagon, label: "Sev-1" },
  "sev-2": { cls: "border-orange-500/30 bg-orange-500/10 text-orange-500", icon: AlertTriangle, label: "Sev-2" },
  "sev-3": { cls: "border-blue-500/30 bg-blue-500/10 text-blue-500", icon: Info, label: "Sev-3" },
} as const;

const STATE_LIST: State[] = ["open", "triaged", "in-progress", "resolved", "closed"];

function IssuesPage() {
  const [sev, setSev] = useState<Severity | "all">("all");
  const [state, setState] = useState<State | "all">("all");
  const filtered = ISSUES.filter((i) => (sev === "all" || i.severity === sev) && (state === "all" || i.state === state));

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bug className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · Issues</p>
          <h1 className="text-3xl font-semibold tracking-tight">Issues</h1>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Open" value={ISSUES.filter((i) => i.state !== "resolved" && i.state !== "closed").length} />
        <Kpi label="Sev-1" value={ISSUES.filter((i) => i.severity === "sev-1").length} tone="destructive" />
        <Kpi label="In progress" value={ISSUES.filter((i) => i.state === "in-progress").length} />
        <Kpi label="Resolved this week" value={ISSUES.filter((i) => i.state === "resolved").length} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1 text-xs">
          {(["all", "sev-1", "sev-2", "sev-3"] as const).map((s) => (
            <button key={s} onClick={() => setSev(s)} className={`rounded-md px-2 py-1 transition ${sev === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{s === "all" ? "All severity" : s}</button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1 text-xs">
          <button onClick={() => setState("all")} className={`rounded-md px-2 py-1 transition ${state === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>All state</button>
          {STATE_LIST.map((s) => (
            <button key={s} onClick={() => setState(s)} className={`rounded-md px-2 py-1 transition ${state === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Comments</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => {
              const meta = SEV_META[i.severity];
              return (
                <tr key={i.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium">{i.title}</p>
                    <p className="text-[11px] text-muted-foreground">{i.id} · {i.project} · reported by {i.reporter}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${meta.cls}`}>
                      <meta.icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">{i.state.replace("-", " ")}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{i.category}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{i.assignee.charAt(0)}</span>
                      {i.assignee}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{i.age}</td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground"><MessageSquare className="mr-1 inline h-3 w-3" />{i.comments}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "destructive" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone === "destructive" ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}
