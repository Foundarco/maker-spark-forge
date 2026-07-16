import { createFileRoute } from "@tanstack/react-router";
import { Eye, CheckCircle2, XCircle, Clock, Users, FileText, Beaker } from "lucide-react";

export const Route = createFileRoute("/_hq/design-reviews")({
  head: () => ({ meta: [{ title: "Reviews & Testing — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: DesignReviewsPage,
});

type Review = {
  id: string;
  title: string;
  project: string;
  kind: "DR-1" | "DR-2" | "DR-3" | "DVT" | "PVT" | "Test";
  scheduled: string;
  status: "scheduled" | "in-progress" | "passed" | "failed";
  chair: string;
  panel: string[];
  findings: number;
  blockers: number;
};

const REVIEWS: Review[] = [
  { id: "DR-321", title: "Motion system architecture review", project: "CLV-ONE-R2", kind: "DR-2", scheduled: "2026-07-22", status: "scheduled", chair: "K. Chen", panel: ["J. Alvarez", "M. Rossi", "S. Nguyen"], findings: 0, blockers: 0 },
  { id: "DR-320", title: "Hotend V4 · PVT gate", project: "CLV-HOTEND-V4", kind: "PVT", scheduled: "2026-07-18", status: "in-progress", chair: "M. Rossi", panel: ["K. Chen", "D. Patel"], findings: 3, blockers: 0 },
  { id: "DR-319", title: "Enclosure interlock safety review", project: "CLV-PRO", kind: "DR-3", scheduled: "2026-07-15", status: "failed", chair: "D. Patel", panel: ["J. Alvarez", "L. Berger"], findings: 6, blockers: 2 },
  { id: "DR-318", title: "Firmware 2.5 architecture", project: "CLV-FW-2.5", kind: "DR-1", scheduled: "2026-07-12", status: "passed", chair: "S. Nguyen", panel: ["R. Owens", "K. Chen"], findings: 4, blockers: 0 },
  { id: "DR-317", title: "Frame assembly DVT walk-through", project: "CLV-ONE-R2", kind: "DVT", scheduled: "2026-07-08", status: "passed", chair: "K. Chen", panel: ["J. Alvarez"], findings: 2, blockers: 0 },
];

type Test = { id: string; name: string; project: string; result: "pass" | "fail" | "running"; passRate: number; runs: number; last: string };
const TESTS: Test[] = [
  { id: "T-HTC-01", name: "Hotend 500h heat cycle", project: "CLV-HOTEND-V4", result: "pass", passRate: 96, runs: 25, last: "2h" },
  { id: "T-EMC-01", name: "EMC pre-scan · 30MHz–1GHz", project: "CLV-ONE-R2", result: "fail", passRate: 60, runs: 5, last: "1d" },
  { id: "T-VIB-02", name: "Vibration profile · road", project: "CLV-ONE-R2", result: "pass", passRate: 100, runs: 3, last: "3d" },
  { id: "T-FW-CI", name: "Firmware CI · full suite", project: "CLV-FW-2.5", result: "running", passRate: 89, runs: 412, last: "12m" },
  { id: "T-PRT-STD", name: "Print quality · standard suite", project: "CLV-HOTEND-V4", result: "pass", passRate: 93, runs: 88, last: "6h" },
];

const REV_META = {
  scheduled: { cls: "border-muted-foreground/30 bg-muted text-muted-foreground", icon: Clock, label: "Scheduled" },
  "in-progress": { cls: "border-blue-500/30 bg-blue-500/10 text-blue-500", icon: Clock, label: "In progress" },
  passed: { cls: "border-green-500/30 bg-green-500/10 text-green-500", icon: CheckCircle2, label: "Passed" },
  failed: { cls: "border-destructive/30 bg-destructive/10 text-destructive", icon: XCircle, label: "Failed" },
} as const;

const TEST_META = {
  pass: { cls: "text-green-500", icon: CheckCircle2, label: "pass" },
  fail: { cls: "text-destructive", icon: XCircle, label: "fail" },
  running: { cls: "text-blue-500", icon: Clock, label: "running" },
} as const;

function DesignReviewsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Eye className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · Reviews</p>
          <h1 className="text-3xl font-semibold tracking-tight">Reviews &amp; Testing</h1>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Open reviews" value={REVIEWS.filter((r) => r.status !== "passed").length} icon={Eye} />
        <Kpi label="Blockers" value={REVIEWS.reduce((s, r) => s + r.blockers, 0)} icon={XCircle} />
        <Kpi label="Tests tracked" value={TESTS.length} icon={Beaker} />
        <Kpi label="Avg pass rate" value={`${Math.round(TESTS.reduce((s, t) => s + t.passRate, 0) / TESTS.length)}%`} icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <p className="mb-3 flex items-center gap-1 text-sm font-semibold"><FileText className="h-4 w-4" /> Design reviews</p>
          <div className="space-y-2">
            {REVIEWS.map((r) => {
              const meta = REV_META[r.status];
              return (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{r.id} · {r.kind} · {r.project}</p>
                      <p className="mt-0.5 text-sm font-medium">{r.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{new Date(r.scheduled).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} · Chair: {r.chair}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${meta.cls}`}>
                      <meta.icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {r.panel.join(", ")}</span>
                    <span>Findings: {r.findings}</span>
                    <span className={r.blockers > 0 ? "text-destructive" : ""}>Blockers: {r.blockers}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mb-3 flex items-center gap-1 text-sm font-semibold"><Beaker className="h-4 w-4" /> Test suites</p>
          <div className="space-y-2">
            {TESTS.map((t) => {
              const meta = TEST_META[t.result];
              return (
                <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.id} · {t.project}</p>
                      <p className="mt-0.5 text-sm font-medium">{t.name}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs ${meta.cls}`}>
                      <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${t.passRate >= 90 ? "bg-green-500" : t.passRate >= 70 ? "bg-yellow-500" : "bg-destructive"}`} style={{ width: `${t.passRate}%` }} />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{t.passRate}% · {t.runs} runs · {t.last} ago</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
