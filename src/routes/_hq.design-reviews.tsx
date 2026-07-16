import { createFileRoute } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, ProjectCell, DateCell } from "@/components/hq/ResourcePage";
import type { ResourceConfig } from "@/components/hq/ResourcePage";

export const Route = createFileRoute("/_hq/design-reviews")({
  head: () => ({ meta: [{ title: "Reviews & Testing — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={config} />,
});

const STATUS = { scheduled: "border-blue-500/30 bg-blue-500/10 text-blue-500", in_progress: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500", passed: "border-green-500/30 bg-green-500/10 text-green-500", failed: "border-destructive/30 bg-destructive/10 text-destructive", cancelled: "border-muted-foreground/30 bg-muted/40 text-muted-foreground" };

const config: ResourceConfig<any> = {
  table: "eng_design_reviews",
  title: "Reviews & Testing",
  eyebrow: "Engineering · Reviews",
  icon: Eye,
  itemName: "review",
  searchable: ["title", "gate", "notes"],
  orderBy: { column: "review_date", ascending: false },
  kpis: (rows) => [
    { label: "Total", value: rows.length, icon: Eye },
    { label: "Scheduled", value: rows.filter((r) => r.status === "scheduled").length, icon: Eye },
    { label: "Passed", value: rows.filter((r) => r.status === "passed").length, icon: Eye },
    { label: "Failed", value: rows.filter((r) => r.status === "failed").length, icon: Eye },
  ],
  columns: [
    { key: "title", label: "Review", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "gate", label: "Gate" },
    { key: "project_id", label: "Project", render: (r, c) => <ProjectCell projectId={r.project_id} projects={c.projects} /> },
    { key: "reviewer_id", label: "Reviewer", render: (r, c) => <UserCell userId={r.reviewer_id} profiles={c.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
    { key: "review_date", label: "Date", render: (r) => <DateCell date={r.review_date} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "gate", label: "Gate", type: "select", options: [
      { value: "EVT", label: "EVT" }, { value: "DVT", label: "DVT" }, { value: "PVT", label: "PVT" },
      { value: "MP", label: "MP" }, { value: "Design", label: "Design" }, { value: "Code", label: "Code" },
    ] },
    { key: "status", label: "Status", type: "select", options: [
      { value: "scheduled", label: "Scheduled" }, { value: "in_progress", label: "In progress" },
      { value: "passed", label: "Passed" }, { value: "failed", label: "Failed" }, { value: "cancelled", label: "Cancelled" },
    ] },
    { key: "project_id", label: "Project", type: "project" },
    { key: "reviewer_id", label: "Reviewer", type: "user" },
    { key: "review_date", label: "Date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
  defaults: { status: "scheduled" },
};
