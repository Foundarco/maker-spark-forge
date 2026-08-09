import {
  LayoutDashboard, Settings, Hash, Calendar, HardDrive, Inbox, Lightbulb, Bell, CheckSquare,
  Target, Calculator, Ruler, FileSignature, Map, MessageSquareWarning, Stamp,
  HardHat, ClipboardList, Users, Clock, Truck, ShieldAlert, ClipboardCheck, ListChecks,
  Store, Handshake, ShoppingCart, Boxes, PackageCheck, PackageOpen,
  Users2, LifeBuoy, MessageCircle, Timer, ShieldCheck, BookOpen,
  Coins, FileSpreadsheet, GitPullRequestArrow, Landmark, Receipt, FileBarChart, Filter,
  IdCard, UserSearch, FileText, GraduationCap, Award, Star, Network, CalendarDays,
  Building2, BarChart3, CalendarRange, Compass,
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

/** Divisions shown in the sidebar switcher. "Core" is always visible on top. */
export const divisions: Division[] = [
  { id: "core", label: "My Workspace", blurb: "Everyday tools", icon: Compass },
  { id: "sales", label: "Sales & Preconstruction", blurb: "Leads, quotes, contracts", icon: Target },
  { id: "field", label: "Field Operations", blurb: "Jobs, crews, safety", icon: HardHat },
  { id: "materials", label: "Materials & Procurement", blurb: "Suppliers, POs, inventory", icon: Boxes },
  { id: "clients", label: "Client Services", blurb: "Support and warranty", icon: Users2 },
  { id: "finance", label: "Finance", blurb: "Costing, invoices, reports", icon: Landmark },
  { id: "people", label: "People & Operations", blurb: "HR and administration", icon: IdCard },
];

export const navGroups: NavGroup[] = [
  {
    label: "Core",
    division: "core",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Communication", to: "/channels", icon: Hash },
      { label: "Email", to: "/mail", icon: Inbox },
      { label: "Calendar", to: "/calendar", icon: Calendar },
      { label: "Drive", to: "/drive", icon: HardDrive },
      { label: "Notes", to: "/rd-ideas", icon: Lightbulb },
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "My Tasks", to: "/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Sales & Quoting",
    division: "sales",
    items: [
      { label: "Leads & Bids", to: "/leads", icon: Target },
      { label: "Quotes", to: "/quotes", icon: Calculator },
      { label: "Proposals & Contracts", to: "/proposals", icon: FileSignature },
      { label: "Pipeline", to: "/pipeline", icon: Filter },
      { label: "Client Directory", to: "/clients", icon: Users2 },
    ],
  },
  {
    label: "Preconstruction",
    division: "sales",
    items: [
      { label: "Takeoffs & RFQs", to: "/takeoffs", icon: Ruler },
      { label: "Plans & Drawings", to: "/plans", icon: Map },
      { label: "RFIs & Submittals", to: "/rfis", icon: MessageSquareWarning },
      { label: "Permits & Approvals", to: "/permits", icon: Stamp },
    ],
  },
  {
    label: "Field Ops",
    division: "field",
    items: [
      { label: "Jobs", to: "/jobs", icon: HardHat },
      { label: "Scheduling", to: "/scheduling", icon: CalendarRange },
      { label: "Daily Logs", to: "/daily-logs", icon: ClipboardList },
      { label: "Crews & Dispatch", to: "/crews", icon: Users },
      { label: "Time & Attendance", to: "/time-tracking", icon: Clock },
      { label: "Equipment & Fleet", to: "/equipment", icon: Truck },
      { label: "Safety & Incidents", to: "/safety", icon: ShieldAlert },
      { label: "Inspections & QC", to: "/inspections", icon: ClipboardCheck },
      { label: "Punch List", to: "/punch-list", icon: ListChecks },
    ],
  },
  {
    label: "Materials",
    division: "materials",
    items: [
      { label: "Suppliers", to: "/suppliers", icon: Store },
      { label: "Subcontractors", to: "/subcontractors", icon: Handshake },
      { label: "Purchase Orders", to: "/purchase-orders", icon: ShoppingCart },
      { label: "Inventory", to: "/inventory", icon: Boxes },
      { label: "Deliveries", to: "/deliveries", icon: PackageCheck },
      { label: "Receiving", to: "/receiving", icon: PackageOpen },
    ],
  },
  {
    label: "Clients",
    division: "clients",
    items: [
      { label: "Service Requests", to: "/tickets", icon: LifeBuoy },
      { label: "Conversations", to: "/live-chat", icon: MessageCircle },
      { label: "Client Timeline", to: "/customer-timeline", icon: Timer },
      { label: "Warranty Claims", to: "/warranty-claims", icon: ShieldCheck },
      { label: "Knowledge Base", to: "/kb", icon: BookOpen },
    ],
  },
  {
    label: "Finance",
    division: "finance",
    items: [
      { label: "Job Costing", to: "/job-costing", icon: Coins },
      { label: "Invoices & Draws", to: "/invoices", icon: FileSpreadsheet },
      { label: "Change Orders", to: "/change-orders", icon: GitPullRequestArrow },
      { label: "Accounting", to: "/accounting", icon: Landmark },
      { label: "Expenses", to: "/expenses", icon: Receipt },
      { label: "Reports", to: "/financial-reports", icon: FileBarChart },
    ],
  },
  {
    label: "People",
    division: "people",
    items: [
      { label: "Employee Directory", to: "/employees", icon: IdCard },
      { label: "Hiring", to: "/hiring", icon: UserSearch },
      { label: "Applications", to: "/applicants", icon: FileText },
      { label: "Onboarding", to: "/onboarding", icon: GraduationCap },
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
      { label: "Departments", to: "/admin/departments", icon: Building2 },
      { label: "Company Tasks", to: "/company-tasks", icon: CheckSquare },
      { label: "Resource Planning", to: "/resource-planning", icon: Users },
      { label: "Dashboards", to: "/analytics", icon: BarChart3 },
      { label: "Company Settings", to: "/admin/company", icon: Settings, badge: "Admin" },
    ],
  },
];
