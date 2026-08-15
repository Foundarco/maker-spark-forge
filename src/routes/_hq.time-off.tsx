import { createFileRoute } from "@tanstack/react-router";
import { CalendarOff } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const cfg: ResourceConfig<any> = {
  table: "hr_time_off",
  title: "Time Off",
  eyebrow: "People",
  icon: CalendarOff,
  itemName: "request",
  orderBy: { column: "start_date", ascending: false },
  searchable: ["type", "reason"],
  defaults: { status: "pending", type: "vacation" },
  kpis: (rows) => [
    { label: "Requests", value: rows.length, icon: CalendarOff },
    { label: "Pending", value: rows.filter((r) => r.status === "pending").length, icon: CalendarOff },
    { label: "Approved", value: rows.filter((r) => r.status === "approved").length, icon: CalendarOff },
  ],
  columns: [
    { key: "user_id", label: "Person", render: (r, ctx) => <UserCell userId={r.user_id} profiles={ctx.profiles} /> },
    { key: "type", label: "Type", render: (r) => <StatusBadge value={r.type} /> },
    { key: "start_date", label: "Start", render: (r) => <DateCell date={r.start_date} /> },
    { key: "end_date", label: "End", render: (r) => <DateCell date={r.end_date} /> },
    { key: "days", label: "Days" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={{ pending: "border-amber-500/20 bg-amber-500/10 text-amber-600", approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", denied: "border-destructive/20 bg-destructive/10 text-destructive" }} /> },
  ],
  fields: [
    { key: "user_id", label: "Person", type: "user" },
    { key: "type", label: "Type", type: "select", options: ["vacation","sick","personal","bereavement","parental","unpaid"].map((v) => ({ value: v, label: v })), required: true },
    { key: "start_date", label: "Start date", type: "date", required: true },
    { key: "end_date", label: "End date", type: "date", required: true },
    { key: "days", label: "Days", type: "number" },
    { key: "status", label: "Status", type: "select", options: [{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "denied", label: "Denied" }, { value: "cancelled", label: "Cancelled" }], required: true },
    { key: "approver_id", label: "Approver", type: "user" },
    { key: "reason", label: "Reason", type: "textarea", full: true },
  ],
};

export const Route = createFileRoute("/_hq/time-off")({
  head: () => ({ meta: [{ title: "Time Off — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
