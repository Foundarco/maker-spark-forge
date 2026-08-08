import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "con_estimates",
  title: "Estimates",
  eyebrow: "Preconstruction",
  icon: Calculator,
  itemName: "estimate",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["title", "estimate_number", "scope"],
  defaults: { status: "draft", markup_pct: 15 },
  kpis: (rows) => [
    { label: "Estimates", value: rows.length, icon: Calculator },
    { label: "Open value", value: `$${rows.filter((r) => r.status !== "lost").reduce((s, r) => s + Number(r.total || 0), 0).toLocaleString()}`, icon: Calculator },
    { label: "Approved", value: rows.filter((r) => r.status === "approved").length, icon: Calculator },
  ],
  columns: [
    { key: "estimate_number", label: "No.", render: (r) => <span className="font-mono text-xs">{r.estimate_number || "—"}</span> },
    { key: "title", label: "Estimate", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "total", label: "Total", render: (r) => <span className="font-mono">${Number(r.total || 0).toLocaleString()}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "estimator_id", label: "Estimator", render: (r, ctx) => <UserCell userId={r.estimator_id} profiles={ctx.profiles} /> },
    { key: "valid_until", label: "Valid until", render: (r) => <DateCell date={r.valid_until} /> },
  ],
  fields: [
    { key: "estimate_number", label: "Estimate number", type: "text", placeholder: "EST-2032" },
    { key: "title", label: "Title", type: "text", required: true },
    { key: "status", label: "Status", type: "select", options: ["draft", "sent", "approved", "declined", "lost"].map((v) => ({ value: v, label: v })) },
    { key: "estimator_id", label: "Estimator", type: "user" },
    { key: "subtotal", label: "Subtotal", type: "number" },
    { key: "markup_pct", label: "Markup %", type: "number" },
    { key: "total", label: "Total", type: "number" },
    { key: "valid_until", label: "Valid until", type: "date" },
    { key: "scope", label: "Scope of work", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/estimates")({
  head: () => ({ meta: [{ title: "Estimates — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
