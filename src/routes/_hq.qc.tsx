import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/qc")({
  head: () => ({ meta: [{ title: "Quality & Inspections — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { pending: "border-muted-foreground/30 bg-muted/40 text-muted-foreground", pass: "border-green-500/30 bg-green-500/10 text-green-500", fail: "border-destructive/30 bg-destructive/10 text-destructive", rework: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500" };

const config: ResourceConfig<any> = {
  table: "mfg_inspections",
  title: "Quality & Inspections",
  eyebrow: "Manufacturing · Quality",
  icon: ShieldCheck,
  itemName: "inspection",
  searchable: ["notes"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => {
    const done = rows.filter((r) => r.status === "pass" || r.status === "fail").length;
    const yield_ = done ? Math.round((rows.filter((r) => r.status === "pass").length / done) * 100) : 0;
    return [
      { label: "Total", value: rows.length, icon: ShieldCheck },
      { label: "Passed", value: rows.filter((r) => r.status === "pass").length, icon: CheckCircle2 },
      { label: "Failed", value: rows.filter((r) => r.status === "fail").length, icon: XCircle },
      { label: "Yield", value: `${yield_}%`, icon: Clock, hint: `${done} completed` },
    ];
  },
  columns: [
    { key: "work_order_id", label: "Work Order", render: (r, c) => {
      const wo = c.workorders.find((w) => w.id === r.work_order_id);
      return wo ? <span className="font-mono text-xs">{wo.order_number}</span> : <span className="text-muted-foreground text-xs">—</span>;
    } },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "defect_count", label: "Defects", render: (r) => <span className={`tabular-nums ${r.defect_count > 0 ? "text-destructive" : ""}`}>{r.defect_count}</span> },
    { key: "inspector_id", label: "Inspector", render: (r, c) => <UserCell userId={r.inspector_id} profiles={c.profiles} /> },
    { key: "inspected_at", label: "Date", render: (r) => <DateCell date={r.inspected_at} /> },
  ],
  fields: [
    { key: "work_order_id", label: "Work order", type: "workorder", required: true },
    { key: "status", label: "Status", type: "select", options: [
      { value: "pending", label: "Pending" }, { value: "pass", label: "Pass" }, { value: "fail", label: "Fail" }, { value: "rework", label: "Rework" },
    ] },
    { key: "defect_count", label: "Defect count", type: "number" },
    { key: "inspector_id", label: "Inspector", type: "user" },
    { key: "inspected_at", label: "Inspected at", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "pending", defect_count: 0 },
};
