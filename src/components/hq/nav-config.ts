import {
  LayoutDashboard, Settings, Hash, Calendar, HardDrive, Inbox, Lightbulb, Bell, CheckSquare,
  Target, Calculator, Ruler, FileSignature, Map, MessageSquareWarning, Stamp,
  ClipboardList, Users, Clock, Truck, ShieldAlert, ClipboardCheck, ListChecks,
  Store, Handshake, ShoppingCart, Boxes, PackageCheck, PackageOpen,
  Users2, LifeBuoy, MessageCircle, Timer, BookOpen,
  Coins, FileSpreadsheet, GitPullRequestArrow, Landmark, Receipt, FileBarChart, Filter,
  IdCard, UserSearch, FileText, GraduationCap, Award, Star, Network, CalendarDays,
  Building2, BarChart3, CalendarRange, Compass, Cpu, Plane, Radar, FlaskConical, Grip,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: any;
  badge?: string;
};

export type NavGroup = {
  label: string;
  division: DivisionId;
  items: NavItem[];
};

export type DivisionId = "core" | "sales" | "field" | "materials" | "clients" | "finance" | "people";

export type Division = {
  id: DivisionId;
  label: string;
  blurb: string;
  icon: any;
};

/** Operating divisions of the organization. "Core" is always visible on top. */
export const divisions: Division[] = [
  { id: "core", label: "My Workspace", blurb: "Everyday tools", icon: Compass },
  { id: "field", label: "Mission Operations", blurb: "Incidents, deployments, ops center", icon: Radar },
  { id: "sales", label: "Engineering", blurb: "UAV, sensors, software, testing", icon: Cpu },
  { id: "materials", label: "Fleet & Supply", blurb: "Aircraft, parts, suppliers", icon: Plane },
  { id: "clients", label: "Research & Partners", blurb: "Research, partners, knowledge", icon: FlaskConical },
  { id: "finance", label: "Funding", blurb: "Donors, grants, budgets", icon: Landmark },
  { id: "people", label: "People & Operations", blurb: "Team and administration", icon: IdCard },
];

export const navGroups: NavGroup[] = [
  {
    label: "Core",
    division: "core",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Email", to: "/mail", icon: Inbox },
      { label: "Calendar", to: "/calendar", icon: Calendar },
      { label: "Drive", to: "/drive", icon: HardDrive },
      { label: "Notes", to: "/rd-ideas", icon: Lightbulb },
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "My Tasks", to: "/tasks", icon: CheckSquare },
      { label: "My Time", to: "/my-time", icon: Timer },
    ],
  },
  {
    label: "Mission Operations",
    division: "field",
    items: [
      { label: "Incidents", to: "/jobs", icon: ShieldAlert },
      { label: "Deployments", to: "/scheduling", icon: CalendarRange },
      { label: "Situation Reports", to: "/daily-logs", icon: ClipboardList },
      { label: "Response Teams", to: "/crews", icon: Users },
      { label: "Field Time", to: "/time-tracking", icon: Clock },
      { label: "Safety", to: "/safety", icon: ShieldAlert },
      { label: "Field Trials", to: "/inspections", icon: ClipboardCheck },
      { label: "Follow-ups", to: "/punch-list", icon: ListChecks },
    ],
  },
  {
    label: "Engineering",
    division: "sales",
    items: [
      { label: "Engineering Projects", to: "/eng-projects", icon: Cpu },
      { label: "CAD & Drawings", to: "/plans", icon: Map },
      { label: "Test Plans", to: "/takeoffs", icon: Ruler },
      { label: "Engineering Requests", to: "/rfis", icon: MessageSquareWarning },
      { label: "Compliance & Approvals", to: "/permits", icon: Stamp },
      { label: "Change Requests", to: "/change-orders", icon: GitPullRequestArrow },
    ],
  },
  {
    label: "Fleet & Supply",
    division: "materials",
    items: [
      { label: "Aircraft & Assets", to: "/equipment", icon: Plane },
      { label: "Parts Inventory", to: "/inventory", icon: Boxes },
      { label: "Suppliers", to: "/suppliers", icon: Store },
      { label: "Fabrication Partners", to: "/subcontractors", icon: Handshake },
      { label: "Purchase Orders", to: "/purchase-orders", icon: ShoppingCart },
      { label: "Shipments", to: "/deliveries", icon: PackageCheck },
      { label: "Receiving", to: "/receiving", icon: PackageOpen },
    ],
  },
  {
    label: "Research & Partners",
    division: "clients",
    items: [
      { label: "Research Requests", to: "/tickets", icon: LifeBuoy },
      { label: "Partner Directory", to: "/clients", icon: Users2 },
      { label: "Partner Comms", to: "/client-comms", icon: MessageCircle },
      { label: "Live Chat", to: "/live-chat", icon: MessageSquareWarning },
      { label: "Partner Timeline", to: "/customer-timeline", icon: Timer },
      { label: "Knowledge Base", to: "/kb", icon: BookOpen },
    ],
  },
  {
    label: "Funding",
    division: "finance",
    items: [
      { label: "Donors & Sponsors", to: "/leads", icon: Target },
      { label: "Grants & Proposals", to: "/proposals", icon: FileSignature },
      { label: "Funding Requests", to: "/quotes", icon: Calculator },
      { label: "Funding Pipeline", to: "/pipeline", icon: Filter },
      { label: "Program Budgets", to: "/job-costing", icon: Coins },
      { label: "Invoices", to: "/invoices", icon: FileSpreadsheet },
      { label: "Expenses", to: "/expenses", icon: Receipt },
      { label: "Accounting", to: "/accounting", icon: Landmark },
      { label: "Reports", to: "/financial-reports", icon: FileBarChart },
    ],
  },
  {
    label: "People",
    division: "people",
    items: [
      { label: "Team Directory", to: "/employees", icon: IdCard },
      { label: "Recruiting", to: "/hiring", icon: UserSearch },
      { label: "Applications", to: "/applicants", icon: FileText },
      { label: "Onboarding", to: "/onboarding", icon: GraduationCap },
      { label: "Attendance & Leave", to: "/attendance", icon: Clock },
      { label: "Time Off", to: "/time-off", icon: CalendarDays },
      { label: "Certifications", to: "/certifications", icon: Award },
      { label: "Training", to: "/training", icon: GraduationCap },
      { label: "Performance", to: "/reviews", icon: Star },
      { label: "Org Chart", to: "/org-chart", icon: Network },
    ],
  },
  {
    label: "Operations",
    division: "people",
    items: [
      { label: "Teams", to: "/teams", icon: Network },
      { label: "Departments", to: "/admin/departments", icon: Building2 },
      { label: "Org Tasks", to: "/company-tasks", icon: CheckSquare },
      { label: "Resource Planning", to: "/resource-planning", icon: Users },
      { label: "Dashboards", to: "/analytics", icon: BarChart3 },
      { label: "Fleet Logistics", to: "/equipment", icon: Truck },
      { label: "Organization", to: "/admin/org", icon: Network, badge: "Admin" },
      { label: "Team Apps", to: "/admin/apps", icon: Grip, badge: "Admin" },
      { label: "Org Settings", to: "/admin/company", icon: Settings, badge: "Admin" },
    ],
  },
];

