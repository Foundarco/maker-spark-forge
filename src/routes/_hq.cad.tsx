import { createFileRoute, Link } from "@tanstack/react-router";
import { FileBox, Layers, Download, ExternalLink, GitBranch, Clock } from "lucide-react";

export const Route = createFileRoute("/_hq/cad")({
  head: () => ({ meta: [{ title: "Design Library — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: CadPage,
});

type Part = {
  id: string;
  name: string;
  assembly: string;
  format: string;
  rev: string;
  owner: string;
  updated: string;
  status: "released" | "wip" | "review";
  checksum: string;
};

const PARTS: Part[] = [
  { id: "PN-101", name: "Frame · Upper cross-member", assembly: "Clovr One R2", format: "STEP", rev: "C.02", owner: "K. Chen", updated: "2d ago", status: "released", checksum: "a91e…4c2f" },
  { id: "PN-102", name: "Y-axis rail carriage", assembly: "Clovr One R2", format: "STEP", rev: "D.01", owner: "K. Chen", updated: "5h ago", status: "review", checksum: "77bc…9d10" },
  { id: "PN-201", name: "Hotend V4 · Heat block", assembly: "Hotend V4", format: "STEP", rev: "E.03", owner: "M. Rossi", updated: "1d ago", status: "released", checksum: "42a1…7fe0" },
  { id: "PN-202", name: "Hotend V4 · Nozzle adapter", assembly: "Hotend V4", format: "STL", rev: "E.03", owner: "M. Rossi", updated: "1d ago", status: "released", checksum: "b30d…22ac" },
  { id: "PN-301", name: "Enclosure door hinge", assembly: "Clovr Pro", format: "STEP", rev: "B.05", owner: "D. Patel", updated: "3d ago", status: "wip", checksum: "5f01…88de" },
  { id: "PN-302", name: "HEPA carbon housing", assembly: "Clovr Pro", format: "STEP", rev: "A.11", owner: "D. Patel", updated: "6h ago", status: "review", checksum: "1c22…f4bb" },
  { id: "PN-401", name: "Heated bed carrier", assembly: "Clovr One R2", format: "STEP", rev: "B.02", owner: "J. Alvarez", updated: "1w ago", status: "released", checksum: "9ee7…0451" },
  { id: "PN-501", name: "Cable chain link", assembly: "Common", format: "STEP", rev: "F.09", owner: "K. Chen", updated: "4d ago", status: "released", checksum: "3d55…c1e8" },
];

const STATUS_CLS: Record<Part["status"], string> = {
  released: "border-green-500/30 bg-green-500/10 text-green-500",
  review: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
  wip: "border-blue-500/30 bg-blue-500/10 text-blue-500",
};

function CadPage() {
  const assemblies = Array.from(new Set(PARTS.map((p) => p.assembly)));

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileBox className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · Design Library</p>
            <h1 className="text-3xl font-semibold tracking-tight">Design Library</h1>
          </div>
        </div>
        <Link to="/cad-viewer" className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"><ExternalLink className="h-3 w-3" /> Open CAD viewer</Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Parts tracked" value={PARTS.length} icon={Layers} />
        <Kpi label="Released" value={PARTS.filter((p) => p.status === "released").length} icon={GitBranch} />
        <Kpi label="In review" value={PARTS.filter((p) => p.status === "review").length} icon={Clock} />
        <Kpi label="Assemblies" value={assemblies.length} icon={FileBox} />
      </div>

      <div className="space-y-4">
        {assemblies.map((asm) => (
          <section key={asm} className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">{asm}</p>
              <p className="text-[11px] text-muted-foreground">{PARTS.filter((p) => p.assembly === asm).length} parts</p>
            </header>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Part</th>
                  <th className="px-4 py-2">Rev</th>
                  <th className="px-4 py-2">Format</th>
                  <th className="px-4 py-2">Owner</th>
                  <th className="px-4 py-2">Updated</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PARTS.filter((p) => p.assembly === asm).map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-2">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.id} · {p.checksum}</p>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{p.rev}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{p.format}</td>
                    <td className="px-4 py-2 text-xs">{p.owner}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{p.updated}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${STATUS_CLS[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] hover:bg-muted"><Download className="h-3 w-3" /> {p.format}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
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
