import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareWarning } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, JobCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { open: "border-amber-200 bg-amber-50 text-amber-700", answered: "border-emerald-200 bg-emerald-50 text-emerald-700", closed: "border-border bg-muted/40 text-muted-foreground", overdue: "border-red-200 bg-red-50 text-red-700" };

const cfg: ResourceConfig<any> = {
  table: "con_submittals",
  title: "RFIs & Submittals",
  eyebrow: "Preconstruction",
  icon: MessageSquareWarning,
  itemName: "RFI",
  noCreatedBy: true,
  orderBy: { column: "created_at", ascending: false },
  searchable: ["title", "number", "spec_section", "question"],
  kpis: (rows) => [
    { label: "Open", value: rows.filter((r) => r.status === "open").length, icon: MessageSquareWarning },
    { label: "Answered", value: rows.filter((r) => r.status === "answered").length, icon: MessageSquareWarning },
    { label: "RFIs", value: rows.filter((r) => r.kind === "rfi").length, icon: MessageSquareWarning },
    { label: "Submittals", value: rows.filter((r) => r.kind === "submittal").length, icon: MessageSquareWarning },
  ],
  columns: [
    { key: "number", label: "#", render: (r) => <span className="font-mono text-xs">{r.number ?? "—"}</span> },
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "kind", label: "Type", render: (r) => <StatusBadge value={r.kind} /> },
    { key: "job_id", label: "Job", render: (r, c) => <JobCell jobId={r.job_id} jobs={c.jobs} /> },
    { key: "ball_in_court", label: "Ball in court", render: (r, c) => <UserCell userId={r.ball_in_court} profiles={c.profiles} /> },
    { key: "due_date", label: "Due", render: (r) => <DateCell date={r.due_date} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true, full: true },
    { key: "number", label: "Number", type: "text", placeholder: "RFI-001" },
    { key: "kind", label: "Type", type: "select", options: [{ value: "rfi", label: "RFI" }, { value: "submittal", label: "Submittal" }] },
    { key: "job_id", label: "Job", type: "job" },
    { key: "spec_section", label: "Spec section", type: "text" },
    { key: "ball_in_court", label: "Ball in court", type: "user" },
    { key: "due_date", label: "Due date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["open", "answered", "closed"].map((v) => ({ value: v, label: v })) },
    { key: "question", label: "Question / scope", type: "textarea" },
    { key: "answer", label: "Answer", type: "textarea" },
  ],
  defaults: { kind: "rfi", status: "open" },
};

export const Route = createFileRoute("/_hq/rfis")({
  head: () => ({ meta: [{ title: "RFIs & Submittals — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
