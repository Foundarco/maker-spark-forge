import {
  LayoutDashboard, Bot, Settings, Users, Shield,
  MessagesSquare, Hash, Video, Calendar,
  FolderKanban, CheckSquare, Flag, FileBox, Cpu, Terminal, GitBranch, BookText, ListTree, Eye, FileBarChart, Bug,
  Factory, ClipboardList, Boxes, ShieldCheck, Activity, Package, Store, ShoppingCart, MapPin,
  LifeBuoy, MessageCircle, ShieldAlert, Hammer, BookOpen, Timer,
  Receipt, Users2, Filter, ScrollText, Tag, LineChart,
  Landmark, FileSpreadsheet, ShoppingBag, Calculator,
  Globe, Send, Share2, Palette, BarChart3, Rocket,
  Target, Map, StickyNote, Handshake, Gavel, Compass,
  IdCard, UserSearch, ClipboardCheck as OnboardIcon, Clock, Star, Network,
  FolderOpen, Share, Lock, FileCode,
  Inbox, SendHorizontal, Users as UsersAlt, Filter as FilterAlt,
  Server, Plug, ScrollText as LogsIcon,
  Lightbulb,
  Package as ProdIcon, Sparkles, Layers,
  Workflow, ClipboardCheck as ApprovalIcon, Clock as ScheduleIcon,
  Building, KeyRound as PolicyIcon,
  Sparkle,
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
      { label: "Ideas", to: "/rd-ideas", icon: Lightbulb },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },

  {
    label: "Communication",
    items: [
      { label: "Messages", to: "/dm", icon: MessagesSquare },
      { label: "Channels", to: "/channels", icon: Hash },
      { label: "Meetings", to: "/meetings", icon: Video },
      { label: "Meeting Notes", to: "/meeting-notes", icon: StickyNote },
      { label: "Calendar", to: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "Engineering",
    items: [
      { label: "Projects", to: "/projects", icon: FolderKanban },
      { label: "Tasks & Boards", to: "/tasks", icon: CheckSquare },
      { label: "Milestones", to: "/milestones", icon: Flag },
      { label: "Design Library", to: "/cad", icon: FileBox },
      { label: "Firmware & Repos", to: "/firmware", icon: Cpu },
      { label: "BOM & Changes", to: "/bom", icon: ListTree },
      { label: "Reviews & Testing", to: "/design-reviews", icon: Eye },
      { label: "Documentation", to: "/docs", icon: BookText },
      { label: "Issues", to: "/issues", icon: Bug },
    ],
  },
  {
    label: "Manufacturing",
    items: [
      { label: "Assembly Floor · Live", to: "/factory-live", icon: Activity },
      { label: "Production", to: "/production", icon: Factory },
      { label: "Work Orders", to: "/work-orders", icon: ClipboardList },
      { label: "Inventory", to: "/inventory", icon: Boxes },
      { label: "Quality & Calibration", to: "/qc", icon: ShieldCheck },
      { label: "Machines & Maintenance", to: "/machines", icon: Activity },
      { label: "Packaging & Shipping", to: "/packaging", icon: Package },
      { label: "Suppliers & Vendors", to: "/suppliers", icon: Store },
      { label: "Purchasing & RFQs", to: "/purchase-orders", icon: ShoppingCart },
      { label: "Shipping Tracking", to: "/shipping-tracking", icon: MapPin },
    ],
  },
  {
    label: "Customer Service",
    items: [
      { label: "Tickets", to: "/tickets", icon: LifeBuoy },
      { label: "Conversations", to: "/live-chat", icon: MessageCircle },
      { label: "Warranty & RMA", to: "/warranty-claims", icon: ShieldAlert },
      { label: "Repairs & Diagnostics", to: "/repairs", icon: Hammer },
      { label: "Knowledge Base", to: "/kb", icon: BookOpen },
      { label: "Customer Insights", to: "/customer-timeline", icon: Timer },
    ],
  },

  {
    label: "Growth",
    items: [
      { label: "Pipeline & CRM", to: "/pipeline", icon: Filter },
      { label: "Orders & Contracts", to: "/orders", icon: Receipt },
      { label: "Pricing & Discounts", to: "/pricing-admin", icon: Tag },
      { label: "Invoices & Payments", to: "/invoices", icon: FileSpreadsheet },
      { label: "Accounting & Expenses", to: "/accounting", icon: Landmark },
      { label: "Purchasing & Payroll", to: "/purchasing", icon: ShoppingBag },
      { label: "Taxes & Reports", to: "/financial-reports", icon: FileBarChart },
      { label: "Website & Content", to: "/cms", icon: Globe },
      { label: "Campaigns & Social", to: "/email-campaigns", icon: Send },
      { label: "Brand & Launches", to: "/brand-assets", icon: Palette },
      { label: "Growth Analytics", to: "/sales-analytics", icon: LineChart },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Goals & OKRs", to: "/goals", icon: Target },
      { label: "Roadmap", to: "/roadmap", icon: Map },
      { label: "Partnerships & Investors", to: "/partnerships", icon: Handshake },
      { label: "Legal & Policies", to: "/legal-docs", icon: Gavel },
      { label: "Strategy & Decision Log", to: "/strategy", icon: Compass },
    ],
  },
  {
    label: "HR & Administration",
    items: [
      { label: "People", to: "/employees", icon: IdCard },
      { label: "Hiring & Onboarding", to: "/hiring", icon: UserSearch },
      { label: "Time & Attendance", to: "/time-tracking", icon: Clock },
      { label: "Performance & Benefits", to: "/reviews", icon: Star },
      { label: "Org Chart", to: "/org-chart", icon: Network },
      { label: "Admin Center", to: "/admin/users", icon: Users, badge: "Admin" },
    ],
  },
  {
    label: "Files",
    items: [
      { label: "Cloud Storage", to: "/files", icon: FolderOpen },
      { label: "Shared & Versions", to: "/files-shared", icon: Share },
      { label: "Permissions & Backup", to: "/files-permissions", icon: Lock },
      { label: "CAD Viewer", to: "/cad-viewer", icon: FileCode },
    ],
  },
  {
    label: "Email",
    items: [
      { label: "Inbox", to: "/mail", icon: Inbox },
      { label: "Sent & Drafts", to: "/mail-sent", icon: SendHorizontal },
      { label: "Shared Mailboxes", to: "/mail-shared", icon: UsersAlt },
      { label: "Rules & Templates", to: "/mail-rules", icon: FilterAlt },
    ],
  },
  {
    label: "Development",
    items: [
      { label: "Code & Repos", to: "/repos", icon: GitBranch },
      { label: "Software & APIs", to: "/software", icon: Terminal },
      { label: "Integrations", to: "/it-integrations", icon: Plug },
      { label: "Infrastructure & Monitoring", to: "/it-servers", icon: Server },
      { label: "Security & Logs", to: "/it-security", icon: Shield },
    ],
  },
  {
    label: "Product",
    items: [
      { label: "Product Catalog", to: "/product-catalog", icon: ProdIcon },
      { label: "Features & Releases", to: "/product-features", icon: Sparkles },
      { label: "Compatibility", to: "/product-compatibility", icon: Layers },
      { label: "Docs", to: "/product-docs", icon: BookText },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Dashboards", to: "/analytics", icon: BarChart3 },
      { label: "KPIs", to: "/kpis", icon: Target },
      { label: "AI Insights", to: "/ai-insights", icon: Sparkle },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Workflows", to: "/workflows", icon: Workflow },
      { label: "Approvals", to: "/approvals", icon: ApprovalIcon },
      { label: "Scheduled Jobs & Webhooks", to: "/scheduled-jobs", icon: ScheduleIcon },
    ],
  },
];
