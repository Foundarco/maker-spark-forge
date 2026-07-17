import { createFileRoute } from "@tanstack/react-router";
import { Plug, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "dev_integrations",
  title: "Integrations",
  eyebrow: "Development",
  icon: Plug,
  itemName: "integration",
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "vendor", "category", "notes"],
  defaults: { status: "connected", category: "productivity" },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: Plug },
    { label: "Connected", value: rows.filter((r) => r.status === "connected").length, icon: CheckCircle2 },
    { label: "Disconnected", value: rows.filter((r) => r.status === "disconnected").length, icon: XCircle },
    { label: "Vendors", value: new Set(rows.map((r) => r.vendor).filter(Boolean)).size, icon: Building2 },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "vendor", label: "Vendor" },
    { key: "category", label: "Category", render: (r) => <StatusBadge value={r.category} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={{ connected: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", disconnected: "border-destructive/20 bg-destructive/10 text-destructive", error: "border-amber-500/20 bg-amber-500/10 text-amber-600" }} /> },
    { key: "connected_at", label: "Connected", render: (r) => <DateCell date={r.connected_at} /> },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "vendor", label: "Vendor", type: "text" },
    { key: "category", label: "Category", type: "select", options: ["productivity","payments","analytics","communication","storage","dev-tools","identity","other"].map((v) => ({ value: v, label: v })) },
    { key: "status", label: "Status", type: "select", options: [{ value: "connected", label: "Connected" }, { value: "disconnected", label: "Disconnected" }, { value: "error", label: "Error" }] },
    { key: "connected_at", label: "Connected on", type: "date" },
    { key: "owner_id", label: "Owner", type: "user" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/it-integrations")({
  head: () => ({ meta: [{ title: "Integrations — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
