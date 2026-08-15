import { createFileRoute } from "@tanstack/react-router";
import { UserSearch, Users, Star, Calendar } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STAGES = ["applied", "screening", "interview", "offer", "hired", "rejected"];

export const applicantsCfg: ResourceConfig<any> = {
  table: "hr_applicants",
  title: "Applicants",
  eyebrow: "People",
  icon: UserSearch,
  itemName: "applicant",
  orderBy: { column: "created_at", ascending: false },
  searchable: ["name", "email", "role", "department"],
  defaults: { stage: "applied" },
  kpis: (rows) => [
    { label: "Applicants", value: rows.length, icon: Users },
    { label: "Interviewing", value: rows.filter((r) => r.stage === "interview").length, icon: Calendar },
    { label: "Offers", value: rows.filter((r) => r.stage === "offer").length, icon: Star },
    { label: "Hired", value: rows.filter((r) => r.stage === "hired").length, icon: UserSearch },
  ],
  columns: [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "role", label: "Role" },
    { key: "department", label: "Dept", render: (r) => <StatusBadge value={r.department} /> },
    { key: "stage", label: "Stage", render: (r) => <StatusBadge value={r.stage} palette={{ applied: "border-primary/20 bg-primary/10 text-primary", screening: "border-amber-500/20 bg-amber-500/10 text-amber-600", interview: "border-blue-500/20 bg-blue-500/10 text-blue-600", offer: "border-purple-500/20 bg-purple-500/10 text-purple-600", hired: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", rejected: "border-destructive/20 bg-destructive/10 text-destructive" }} /> },
    { key: "rating", label: "★", render: (r) => r.rating ? <span className="font-medium">{"★".repeat(r.rating)}</span> : <span className="text-muted-foreground">—</span> },
    { key: "source", label: "Source" },
    { key: "interviewer_id", label: "Interviewer", render: (r, ctx) => <UserCell userId={r.interviewer_id} profiles={ctx.profiles} /> },
    { key: "created_at", label: "Applied", render: (r) => <DateCell date={r.created_at} /> },
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "role", label: "Applied role", type: "text", required: true },
    { key: "department", label: "Department", type: "select", options: ["Engineering","Manufacturing","Sales","Marketing","Finance","HR","IT","Support","Operations"].map((v) => ({ value: v, label: v })) },
    { key: "stage", label: "Stage", type: "select", options: STAGES.map((s) => ({ value: s, label: s })), required: true },
    { key: "source", label: "Source", type: "select", options: ["LinkedIn","Referral","Website","Job Board","Recruiter","Event"].map((v) => ({ value: v, label: v })) },
    { key: "rating", label: "Rating (1-5)", type: "number" },
    { key: "resume_url", label: "Resume URL", type: "text", full: true },
    { key: "linkedin_url", label: "LinkedIn URL", type: "text", full: true },
    { key: "interview_date", label: "Interview date", type: "date" },
    { key: "interviewer_id", label: "Interviewer", type: "user" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/applicants")({
  head: () => ({ meta: [{ title: "Applicants — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={applicantsCfg} />,
});
