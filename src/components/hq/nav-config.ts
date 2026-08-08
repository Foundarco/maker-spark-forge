import {
  LayoutDashboard, Bot, Settings, Hash, Calendar, HardDrive, Inbox, Lightbulb, Bell, CheckSquare,
  Target, Calculator, Ruler, FileSignature, Map, MessageSquareWarning, Stamp,
  HardHat, ClipboardList, Users, Clock, Truck, ShieldAlert, ClipboardCheck, ListChecks,
  Store, Handshake, ShoppingCart, Boxes, PackageCheck, PackageOpen,
  Users2, LifeBuoy, MessageCircle, Timer, ShieldCheck, BookOpen,
  Coins, FileSpreadsheet, GitPullRequestArrow, Landmark, Receipt, FileBarChart, Filter,
  IdCard, UserSearch, FileText, GraduationCap, Award, Star, Network, CalendarDays,
  Building2, BarChart3,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: any;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Core",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Assistant", to: "/assistant", icon: Bot },
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
    label: "Preconstruction",
    items: [
      { label: "Leads & Bids", to: "/leads", icon: Target },
      { label: "Estimates", to: "/estimates", icon: Calculator },
      { label: "Takeoffs & RFQs", to: "/takeoffs", icon: Ruler },
      { label: "Proposals & Contracts", to: "/proposals", icon: FileSignature },
      { label: "Plans & Drawings", to: "/plans", icon: Map },
      { label: "RFIs & Submittals", to: "/rfis", icon: MessageSquareWarning },
      { label: "Permits & Approvals", to: "/permits", icon: Stamp },
    ],
  },
  {
    label: "Field Ops",
    items: [
      { label: "Jobs", to: "/jobs", icon: HardHat },
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
    items: [
      { label: "Client Directory", to: "/clients", icon: Users2 },
      { label: "Service Requests", to: "/tickets", icon: LifeBuoy },
      { label: "Conversations", to: "/live-chat", icon: MessageCircle },
      { label: "Client Timeline", to: "/customer-timeline", icon: Timer },
      { label: "Warranty Claims", to: "/warranty-claims", icon: ShieldCheck },
      { label: "Knowledge Base", to: "/kb", icon: BookOpen },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Job Costing", to: "/job-costing", icon: Coins },
      { label: "Invoices & Draws", to: "/invoices", icon: FileSpreadsheet },
      { label: "Change Orders", to: "/change-orders", icon: GitPullRequestArrow },
      { label: "Accounting", to: "/accounting", icon: Landmark },
      { label: "Expenses", to: "/expenses", icon: Receipt },
      { label: "Reports", to: "/financial-reports", icon: FileBarChart },
      { label: "Pipeline", to: "/pipeline", icon: Filter },
    ],
  },
  {
    label: "People",
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
    items: [
      { label: "Departments", to: "/admin/departments", icon: Building2 },
      { label: "Company Tasks", to: "/company-tasks", icon: CheckSquare },
      { label: "Resource Planning", to: "/resource-planning", icon: Users },
      { label: "Dashboards", to: "/analytics", icon: BarChart3 },
      { label: "Company Settings", to: "/admin/company", icon: Settings, badge: "Admin" },
    ],
  },
];
