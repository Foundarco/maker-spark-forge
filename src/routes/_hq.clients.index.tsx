import { createFileRoute, Link } from "@tanstack/react-router";
import { Users2 } from "lucide-react";
import { ResourcePage, StatusBadge, UserCell, type ResourceConfig } from "@/components/hq/ResourcePage";

const STATUS = { active: "border-emerald-200 bg-emerald-50 text-emerald-700", prospect: "border-blue-200 bg-blue-50 text-blue-700", past: "border-border bg-muted/40 text-muted-foreground" };

const cfg: ResourceConfig<any> = {
  table: "con_clients",
  title: "Client Directory",
  eyebrow: "Clients",
  icon: Users2,
  itemName: "client",
  orderBy: { column: "name", ascending: true },
  searchable: ["name", "company", "email", "phone", "city", "client_type"],
  kpis: (rows) => [
    { label: "Clients", value: rows.length, icon: Users2 },
    { label: "Active", value: rows.filter((r) => r.status === "active").length, icon: Users2 },
    { label: "Prospects", value: rows.filter((r) => r.status === "prospect").length, icon: Users2 },
    { label: "Repeat owners", value: rows.filter((r) => r.client_type === "Owner").length, icon: Users2 },
  ],
  columns: [
    {
      key: "name",
      label: "Client",
      render: (r) => (
        <Link to="/clients/$id" params={{ id: r.id }} className="block">
          <span className="font-medium text-primary hover:underline">{r.company || r.name}</span>
          {r.company && <span className="block text-xs text-muted-foreground">{r.name}</span>}
        </Link>
      ),
    },
    { key: "client_type", label: "Type" },
    { key: "email", label: "Email", render: (r) => <span className="text-xs text-muted-foreground">{r.email ?? "—"}</span> },
    { key: "phone", label: "Phone" },
    { key: "city", label: "Location", render: (r) => <span className="text-xs text-muted-foreground">{[r.city, r.state].filter(Boolean).join(", ") || "—"}</span> },
    { key: "owner_id", label: "Relationship owner", render: (r, c) => <UserCell userId={r.owner_id} profiles={c.profiles} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} palette={STATUS} /> },
  ],
  fields: [
    { key: "name", label: "Contact name", type: "text", required: true },
    { key: "company", label: "Company", type: "text" },
    { key: "client_type", label: "Client type", type: "select", options: ["Owner", "Developer", "General contractor", "Architect", "Municipality", "Homeowner"].map((v) => ({ value: v, label: v })) },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "address", label: "Address", type: "text", full: true },
    { key: "city", label: "City", type: "text" },
    { key: "state", label: "State", type: "text" },
    { key: "zip", label: "ZIP", type: "text" },
    { key: "owner_id", label: "Relationship owner", type: "user" },
    { key: "status", label: "Status", type: "select", options: ["prospect", "active", "past"].map((v) => ({ value: v, label: v })) },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  defaults: { status: "prospect" },
};

export const Route = createFileRoute("/_hq/clients/")({
  head: () => ({ meta: [{ title: "Client Directory — McGuire HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ResourcePage config={cfg} />,
});
