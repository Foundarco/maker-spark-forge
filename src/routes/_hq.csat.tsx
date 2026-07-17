import { createFileRoute } from "@tanstack/react-router";
import { Smile, TrendingUp, Star } from "lucide-react";
import { ResourcePage, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/csat")({
  head: () => ({ meta: [{ title: "Customer Satisfaction — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const config: ResourceConfig<any> = {
  table: "cs_csat_responses",
  title: "Customer Satisfaction",
  eyebrow: "Customer Service · CSAT",
  icon: Smile,
  itemName: "response",
  searchable: ["customer_name", "customer_email", "comment"],
  orderBy: { column: "created_at", ascending: false },
  kpis: (rows) => {
    const scores = rows.map((r) => Number(r.score)).filter((n) => !Number.isNaN(n));
    const avg = scores.length ? (scores.reduce((s, n) => s + n, 0) / scores.length).toFixed(2) : "—";
    const nps = rows.map((r) => Number(r.nps)).filter((n) => !Number.isNaN(n));
    const promoters = nps.filter((n) => n >= 9).length;
    const detractors = nps.filter((n) => n <= 6).length;
    const npsScore = nps.length ? Math.round(((promoters - detractors) / nps.length) * 100) : "—";
    return [
      { label: "Responses", value: rows.length, icon: Smile },
      { label: "Avg CSAT", value: avg, icon: Star, hint: "out of 5" },
      { label: "NPS", value: npsScore, icon: TrendingUp },
      { label: "Promoters", value: promoters, icon: Star },
    ];
  },
  columns: [
    { key: "customer_name", label: "Customer", render: (r) => <div className="text-xs"><div className="font-medium">{r.customer_name || "Anonymous"}</div>{r.customer_email && <div className="text-muted-foreground">{r.customer_email}</div>}</div> },
    { key: "score", label: "CSAT", render: (r) => <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />{r.score}/5</span> },
    { key: "nps", label: "NPS", render: (r) => r.nps != null ? <span className="tabular-nums">{r.nps}</span> : "—" },
    { key: "comment", label: "Comment", render: (r) => <span className="text-xs text-muted-foreground line-clamp-2 max-w-md">{r.comment || "—"}</span> },
    { key: "source", label: "Source" },
    { key: "created_at", label: "Received", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "customer_name", label: "Customer name", type: "text" },
    { key: "customer_email", label: "Customer email", type: "text" },
    { key: "score", label: "CSAT (1-5)", type: "number", required: true },
    { key: "nps", label: "NPS (0-10)", type: "number" },
    { key: "source", label: "Source", type: "select", options: [
      { value: "email", label: "Email survey" }, { value: "chat", label: "Post-chat" },
      { value: "phone", label: "Phone" }, { value: "in-app", label: "In-app" },
    ] },
    { key: "comment", label: "Comment", type: "textarea", full: true },
  ],
  defaults: { source: "email", score: 5 },
};
