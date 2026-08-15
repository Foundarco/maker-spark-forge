import { createFileRoute } from "@tanstack/react-router";
import { Clock, CalendarOff } from "lucide-react";
import { ResourcePage, StatusBadge, DateCell, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";
import { useState } from "react";

const entriesCfg: ResourceConfig<any> = {
  table: "hr_time_entries",
  title: "Field Time",
  eyebrow: "People",
  icon: Clock,
  itemName: "entry",
  orderBy: { column: "entry_date", ascending: false },
  searchable: ["project", "task", "notes"],
  kpis: (rows) => [
    { label: "Entries", value: rows.length, icon: Clock },
    { label: "Total hours", value: rows.reduce((s, r) => s + Number(r.hours || 0), 0).toFixed(1), icon: Clock },
    { label: "Billable hrs", value: rows.filter((r) => r.billable).reduce((s, r) => s + Number(r.hours || 0), 0).toFixed(1), icon: Clock },
    { label: "People", value: new Set(rows.map((r) => r.user_id).filter(Boolean)).size, icon: Clock },
  ],
  columns: [
    { key: "entry_date", label: "Date", render: (r) => <DateCell date={r.entry_date} /> },
    { key: "user_id", label: "Person", render: (r, ctx) => <UserCell userId={r.user_id} profiles={ctx.profiles} /> },
    { key: "project", label: "Project" },
    { key: "task", label: "Task" },
    { key: "hours", label: "Hours", render: (r) => <span className="font-mono">{Number(r.hours || 0).toFixed(2)}</span> },
    { key: "billable", label: "Billable", render: (r) => <StatusBadge value={r.billable ? "yes" : "no"} palette={{ yes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600", no: "border-border bg-muted/40" }} /> },
  ],
  fields: [
    { key: "user_id", label: "Person", type: "user" },
    { key: "entry_date", label: "Date", type: "date", required: true },
    { key: "hours", label: "Hours", type: "number", required: true },
    { key: "project", label: "Project", type: "text" },
    { key: "task", label: "Task", type: "text" },
    { key: "billable", label: "Billable", type: "bool" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ],
};

const timeOffCfg: ResourceConfig<any> = {
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
    { label: "Total days", value: rows.reduce((s, r) => s + Number(r.days || 0), 0), icon: CalendarOff },
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

function TimeTracking() {
  const [tab, setTab] = useState<"time" | "off">("time");
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-sm">
          <button onClick={() => setTab("time")} className={`px-3 py-1.5 rounded-md ${tab === "time" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Time entries</button>
          <button onClick={() => setTab("off")} className={`px-3 py-1.5 rounded-md ${tab === "off" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Time off</button>
        </div>
      </div>
      <ResourcePage key={tab} config={tab === "time" ? entriesCfg : timeOffCfg} />
    </div>
  );
}

export const Route = createFileRoute("/_hq/time-tracking")({
  head: () => ({ meta: [{ title: "Time & Attendance — Clovr HQ" }, { name: "robots", content: "noindex" }] }),
  component: TimeTracking,
});
