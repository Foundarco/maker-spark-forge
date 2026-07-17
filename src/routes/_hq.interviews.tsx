import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hr_applicants",
  title: "Interviews",
  eyebrow: "HR",
  icon: Calendar,
  itemName: "interview",
  baseFilter: { stage: "interview" },
  defaults: { stage: "interview" },
  orderBy: { column: "interview_date", ascending: true },
  searchable: ["name", "role"],
  kpis: (rows) => [
    { label: "Scheduled", value: rows.filter((r) => r.interview_date).length, icon: Calendar },
    { label: "Candidates", value: rows.length, icon: Calendar },
  ],
  columns: [
    { key: "name", label: "Candidate", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "role", label: "Role" },
    { key: "interview_date", label: "Date", render: (r) => <DateCell date={r.interview_date} /> },
    { key: "interviewer_id", label: "Interviewer", render: (r, ctx) => <UserCell userId={r.interviewer_id} profiles={ctx.profiles} /> },
    { key: "rating", label: "Rating", render: (r) => r.rating ? <StatusBadge value={`${r.rating}/5`} /> : <span className="text-muted-foreground">—</span> },
  ],
  fields: [
    { key: "name", label: "Candidate", type: "text", required: true },
    { key: "email", label: "Email", type: "text" },
    { key: "role", label: "Role", type: "text", required: true },
    { key: "interview_date", label: "Interview date", type: "date", required: true },
    { key: "interviewer_id", label: "Interviewer", type: "user" },
    { key: "rating", label: "Rating (1-5)", type: "number" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/interviews")({
  head: () => ({ meta: [{ title: "Interviews — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
