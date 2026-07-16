import { createFileRoute } from "@tanstack/react-router";
import { Cpu, GitBranch, GitCommit, Github, PlayCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/_hq/firmware")({
  head: () => ({ meta: [{ title: "Firmware & Repos — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: FirmwarePage,
});

type Repo = {
  id: string;
  name: string;
  description: string;
  language: string;
  branch: string;
  lastCommit: string;
  lastCommitBy: string;
  lastCommitTime: string;
  build: "passing" | "failing" | "running";
  openPRs: number;
  release: string;
};

const REPOS: Repo[] = [
  { id: "R-01", name: "clovr/firmware-core", description: "Klipper-based motion & thermals firmware", language: "C / Python", branch: "release/2.4", lastCommit: "feat(is): auto-cal on first boot", lastCommitBy: "S. Nguyen", lastCommitTime: "22 min", build: "passing", openPRs: 4, release: "v2.4.7" },
  { id: "R-02", name: "clovr/bootloader", description: "STM32 secure bootloader + OTA channel", language: "C", branch: "main", lastCommit: "fix: signature verify on partial", lastCommitBy: "K. Chen", lastCommitTime: "3h", build: "passing", openPRs: 1, release: "v1.6.0" },
  { id: "R-03", name: "clovr/slicer", description: "Cross-platform slicer with cloud sync", language: "Rust / TS", branch: "next", lastCommit: "variable layer height v2 wip", lastCommitBy: "R. Owens", lastCommitTime: "1h", build: "running", openPRs: 12, release: "1.0.0-beta.3" },
  { id: "R-04", name: "clovr/cloud-api", description: "Print farm control & telemetry API", language: "TypeScript", branch: "main", lastCommit: "chore: bump supabase-js", lastCommitBy: "L. Berger", lastCommitTime: "5h", build: "passing", openPRs: 2, release: "v3.2.1" },
  { id: "R-05", name: "clovr/hotend-fw", description: "Hotend V4 daughterboard MCU code", language: "C++", branch: "release/E", lastCommit: "add heat-creep guard", lastCommitBy: "M. Rossi", lastCommitTime: "1d", build: "passing", openPRs: 0, release: "v0.9.4" },
  { id: "R-06", name: "clovr/enclosure-ctl", description: "Chamber temperature & HEPA fan controller", language: "C", branch: "main", lastCommit: "wip: door interlock ISR", lastCommitBy: "D. Patel", lastCommitTime: "2d", build: "failing", openPRs: 3, release: "v0.4.0-rc1" },
];

const BUILD_META = {
  passing: { icon: CheckCircle2, cls: "text-green-500", label: "passing" },
  failing: { icon: XCircle, cls: "text-destructive", label: "failing" },
  running: { icon: PlayCircle, cls: "text-blue-500", label: "running" },
} as const;

function FirmwarePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Cpu className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · Firmware</p>
          <h1 className="text-3xl font-semibold tracking-tight">Firmware &amp; Repos</h1>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Repositories" value={REPOS.length} icon={Github} />
        <Kpi label="Green builds" value={REPOS.filter((r) => r.build === "passing").length} icon={CheckCircle2} />
        <Kpi label="Broken builds" value={REPOS.filter((r) => r.build === "failing").length} icon={XCircle} />
        <Kpi label="Open PRs" value={REPOS.reduce((s, r) => s + r.openPRs, 0)} icon={GitBranch} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {REPOS.map((r) => {
          const b = BUILD_META[r.build];
          return (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-semibold"><Github className="h-4 w-4 text-muted-foreground" /> {r.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs ${b.cls}`}>
                  <b.icon className="h-3.5 w-3.5" /> {b.label}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded bg-muted px-2 py-0.5">{r.language}</span>
                <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" /> {r.branch}</span>
                <span className="inline-flex items-center gap-1">Release {r.release}</span>
                <span className="inline-flex items-center gap-1">{r.openPRs} open PR{r.openPRs === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-3 rounded-lg border border-border bg-muted/40 p-2">
                <p className="flex items-center gap-1 text-[11px] font-mono">
                  <GitCommit className="h-3 w-3 text-muted-foreground" /> {r.lastCommit}
                </p>
                <p className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{r.lastCommitBy}</span>
                  <Clock className="h-3 w-3" />
                  <span>{r.lastCommitTime} ago</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
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
