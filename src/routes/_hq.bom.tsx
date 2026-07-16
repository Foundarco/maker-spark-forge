import { createFileRoute } from "@tanstack/react-router";
import { ListTree, DollarSign, AlertTriangle, ArrowUpDown, Layers, Package } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_hq/bom")({
  head: () => ({ meta: [{ title: "BOM & Changes — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: BomPage,
});

type Line = {
  id: string;
  part: string;
  desc: string;
  category: "Frame" | "Motion" | "Electronics" | "Hotend" | "Bed" | "Enclosure" | "Fasteners";
  qty: number;
  unitCost: number;
  supplier: string;
  leadDays: number;
  stock: number;
  risk: "ok" | "watch" | "critical";
};

const ASSEMBLY = "Clovr One · Rev 2";
const LINES: Line[] = [
  { id: "BOM-01", part: "AL-EXT-2020-350", desc: "Aluminum extrusion 2020 · 350mm", category: "Frame", qty: 4, unitCost: 6.4, supplier: "Misumi", leadDays: 10, stock: 480, risk: "ok" },
  { id: "BOM-02", part: "RAIL-MGN12-400", desc: "Linear rail MGN12 · 400mm", category: "Motion", qty: 2, unitCost: 22.5, supplier: "Hiwin", leadDays: 21, stock: 60, risk: "watch" },
  { id: "BOM-03", part: "MOTOR-NEMA17-48", desc: "Stepper motor NEMA17 · 48mm", category: "Motion", qty: 3, unitCost: 14.8, supplier: "LDO", leadDays: 30, stock: 24, risk: "critical" },
  { id: "BOM-04", part: "MCU-STM32H723", desc: "Main controller MCU", category: "Electronics", qty: 1, unitCost: 12.6, supplier: "STMicro", leadDays: 56, stock: 320, risk: "watch" },
  { id: "BOM-05", part: "PSU-24V-350W", desc: "PSU 24V 350W medical-grade", category: "Electronics", qty: 1, unitCost: 38.0, supplier: "MeanWell", leadDays: 14, stock: 210, risk: "ok" },
  { id: "BOM-06", part: "HOT-V4-BLK", desc: "Hotend V4 heat block", category: "Hotend", qty: 1, unitCost: 11.2, supplier: "Clovr Mfg", leadDays: 7, stock: 640, risk: "ok" },
  { id: "BOM-07", part: "HEAT-BED-350", desc: "Silicone heated bed 350×350", category: "Bed", qty: 1, unitCost: 24.5, supplier: "Keenovo", leadDays: 21, stock: 90, risk: "ok" },
  { id: "BOM-08", part: "PANEL-SM-BLK", desc: "Sheet-metal side panel · black", category: "Enclosure", qty: 2, unitCost: 8.9, supplier: "Protolabs", leadDays: 10, stock: 300, risk: "ok" },
  { id: "BOM-09", part: "SCR-M3-8-BHCS", desc: "M3×8 button-head SCS", category: "Fasteners", qty: 42, unitCost: 0.04, supplier: "McMaster", leadDays: 2, stock: 12000, risk: "ok" },
];

type ECO = { id: string; title: string; part: string; reason: string; by: string; date: string; status: "approved" | "review" | "impact" };
const ECOS: ECO[] = [
  { id: "ECO-104", title: "Move to LDO 48mm motors", part: "MOTOR-NEMA17-48", reason: "Torque headroom for input-shaping", by: "K. Chen", date: "2026-06-30", status: "approved" },
  { id: "ECO-105", title: "STM32H723 → H743 dual-source", part: "MCU-STM32H723", reason: "Long-lead risk mitigation", by: "L. Berger", date: "2026-07-10", status: "review" },
  { id: "ECO-106", title: "Rail vendor consolidation", part: "RAIL-MGN12-400", reason: "Cost -14%, single vendor", by: "J. Alvarez", date: "2026-07-12", status: "impact" },
];

const RISK_META = {
  ok: { cls: "border-green-500/30 bg-green-500/10 text-green-500", label: "OK" },
  watch: { cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", label: "Watch" },
  critical: { cls: "border-destructive/30 bg-destructive/10 text-destructive", label: "Critical" },
} as const;

const ECO_META = {
  approved: "border-green-500/30 bg-green-500/10 text-green-500",
  review: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
  impact: "border-destructive/30 bg-destructive/10 text-destructive",
};

function BomPage() {
  const [sortKey, setSortKey] = useState<"cost" | "lead">("cost");
  const extended = LINES.map((l) => ({ ...l, ext: l.qty * l.unitCost }));
  const totalBOM = extended.reduce((s, l) => s + l.ext, 0);
  const criticalCount = LINES.filter((l) => l.risk === "critical").length;
  const sorted = [...extended].sort((a, b) => sortKey === "cost" ? b.ext - a.ext : b.leadDays - a.leadDays);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><ListTree className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Engineering · BOM</p>
          <h1 className="text-3xl font-semibold tracking-tight">BOM &amp; Changes</h1>
          <p className="text-xs text-muted-foreground">Assembly: {ASSEMBLY}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Total BOM cost" value={`$${totalBOM.toFixed(2)}`} icon={DollarSign} />
        <Kpi label="Line items" value={LINES.length} icon={Layers} />
        <Kpi label="Critical parts" value={criticalCount} icon={AlertTriangle} />
        <Kpi label="Open ECOs" value={ECOS.filter((e) => e.status !== "approved").length} icon={Package} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold">Bill of Materials</p>
        <button onClick={() => setSortKey(sortKey === "cost" ? "lead" : "cost")} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted">
          <ArrowUpDown className="h-3 w-3" /> Sort: {sortKey === "cost" ? "Cost" : "Lead time"}
        </button>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit</th>
              <th className="px-4 py-3 text-right">Ext.</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3 text-right">Lead</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((l) => {
              const risk = RISK_META[l.risk];
              return (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <p className="font-medium">{l.part}</p>
                    <p className="text-[11px] text-muted-foreground">{l.desc}</p>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{l.category}</td>
                  <td className="px-4 py-2 text-right">{l.qty}</td>
                  <td className="px-4 py-2 text-right">${l.unitCost.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-medium">${l.ext.toFixed(2)}</td>
                  <td className="px-4 py-2 text-xs">{l.supplier}</td>
                  <td className="px-4 py-2 text-right text-xs">{l.leadDays}d</td>
                  <td className="px-4 py-2 text-right text-xs">{l.stock}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${risk.cls}`}>{risk.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mb-3 text-sm font-semibold">Recent Engineering Change Orders</p>
      <div className="space-y-2">
        {ECOS.map((e) => (
          <div key={e.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{e.id} · {e.part}</p>
              <p className="mt-0.5 text-sm font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.reason} · {e.by} · {e.date}</p>
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${ECO_META[e.status]}`}>{e.status}</span>
          </div>
        ))}
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
