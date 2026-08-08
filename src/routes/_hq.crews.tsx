import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { active: "border-emerald-200 bg-emerald-50 text-emerald-700", standby: "border-amber-200 bg-amber-50 text-amber-700", inactive: "border-border bg-muted/40 text-muted-foreground" };

const cfg: ResourceConfig<any> = {
  table: "con_crews",
  title: "Crews & Dispatch",
  eyebrow: "Field Ops",
  icon: Users,
  itemName: "crew",
  noCreatedBy: true,
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "trade", "notes"],
  kpis: (rows) => [
    { label: "Crews", value: rows.length, icon: Users },
    { label: "Active", value: rows.filter((r) => r.status === "active").length, icon: Users },
    { label: "Headcount", value: rows.reduce((s, r) => s + Number(r.size || 0), 0), icon: Users },
    { label: "Trades", value: new Set(rows.map((r) => r.trade).filter(Boolean)).size, icon: Users },
  ],
  columns: [
    { key: "name", label: "Crew", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "trade", label: "Trade" },
    { key: "foreman_id", label: "Foreman", render: (r, c) => <UserCell userId={r.foreman_id} profiles={c.profiles} /> },
    { key: "size", label: "Size", render: (r) => <span className="font-mono text-xs">{r.size ?? 0}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "name", label: "Crew name", type: "text", required: true },
    { key: "trade", label: "Trade", type: "select", options: ["Carpentry", "Concrete", "Framing", "Excavation", "Roofing", "Finish", "General"].map((v) => ({ value: v, label: v })) },
    { key: "foreman_id", label: "Foreman", type: "user" },
    { key: "size", label: "Crew size", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["active", "standby", "inactive"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "active" },
};

export const Route = createFileRoute("/_hq/crews")({
  head: () => ({ meta: [{ title: "Crews & Dispatch — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
