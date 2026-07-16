import {
  LayoutDashboard, Bell, Search, Bot, User, Settings, Users, Shield,
  MessageSquare, MessagesSquare, Hash, Phone, Video, Megaphone, Rss, Calendar, Contact,
  FolderKanban, CheckSquare, Columns3, GanttChart, Flag, FileBox, Cpu, Terminal, GitBranch, BookText, ListTree, GitPullRequest, Eye, History, TestTube2, NotebookPen, FileBarChart, Bug,
  Factory, ClipboardList, Wrench, Boxes, Warehouse, ShoppingCart, PackageOpen, ShieldCheck, Activity, HardHat, Ruler, Barcode, Package, Truck,
  LifeBuoy, MessageCircle, Mail, PhoneCall, ShieldAlert, Undo2, BookOpen, HelpCircle, Timer, Smile, Stethoscope, Hammer,
  Receipt, Users2, Filter, ScrollText, Building2, Tag, LineChart,
  Landmark, Wallet, FileSpreadsheet, PiggyBank, ShoppingBag, Banknote, Calculator, TrendingUp, Divide, Scale,
  Globe, PenSquare, Send, Share2, CalendarDays, Palette, BarChart3, Newspaper, Rocket, Image,
  Target, Map, Trophy, StickyNote, Handshake, Briefcase, Gavel, BookLock, Compass, ClipboardCheck,
  IdCard, UserSearch, ClipboardCheck as OnboardIcon, GraduationCap, Plane, Clock, Star, Gift, Network,
  FolderOpen, Share, GitCommitHorizontal, Lock, FileCode, DatabaseBackup,
  Inbox, SendHorizontal, PenLine, Users as UsersAlt, Filter as FilterAlt, LayoutTemplate,
  Server, Cable, KeyRound, Plug, ShieldOff, Save, ScrollText as LogsIcon, MonitorCheck, Fingerprint, FileSearch,
  Store, DoorOpen, FileQuestion, Quote, ArchiveRestore, Clock3, CheckCircle2, MapPin,
  Lightbulb, LineChart as ChartLine,
  Package as ProdIcon, Sparkles, Rocket as LaunchIcon, RefreshCw, Layers,
  Zap, Workflow, GitPullRequestArrow, ClipboardCheck as ApprovalIcon, Clock as ScheduleIcon, Bell as NotifyIcon, Webhook, Code2,
  Cog, ShieldPlus, Building, Palette as BrandIcon, Globe2, KeyRound as PolicyIcon,
  Sparkle, Cpu as TwinIcon, Radio, Waypoints, FileClock,
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
      { label: "Calls & Meetings", to: "/meetings", icon: Video },
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
    label: "Sales",
    items: [
      { label: "Sales Pipeline", to: "/pipeline", icon: Filter },
      { label: "CRM & Contacts", to: "/crm", icon: Users2 },
      { label: "Orders", to: "/orders", icon: Receipt },
      { label: "Contracts", to: "/contracts", icon: ScrollText },
      { label: "Pricing & Discounts", to: "/pricing-admin", icon: Tag },
      { label: "Sales Analytics", to: "/sales-analytics", icon: LineChart },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Accounting", to: "/accounting", icon: Landmark },
      { label: "Invoices & Payments", to: "/invoices", icon: FileSpreadsheet },
      { label: "Expenses & Budgets", to: "/expenses", icon: Receipt },
      { label: "Payroll & Purchasing", to: "/purchasing", icon: ShoppingBag },
      { label: "Taxes", to: "/taxes", icon: Calculator },
      { label: "Reports & Forecasting", to: "/financial-reports", icon: FileBarChart },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Website & Blog", to: "/cms", icon: Globe },
      { label: "Email Campaigns", to: "/email-campaigns", icon: Send },
      { label: "Social & Content", to: "/social", icon: Share2 },
      { label: "Brand & Media", to: "/brand-assets", icon: Palette },
      { label: "Analytics & Press", to: "/marketing-analytics", icon: BarChart3 },
      { label: "Product Launches", to: "/launches", icon: Rocket },
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
    label: "Human Resources",
    items: [
      { label: "Employees", to: "/employees", icon: IdCard },
      { label: "Recruiting", to: "/hiring", icon: UserSearch },
      { label: "Onboarding & Training", to: "/onboarding", icon: OnboardIcon },
      { label: "Time & Attendance", to: "/time-tracking", icon: Clock },
      { label: "Performance & Benefits", to: "/reviews", icon: Star },
      { label: "Org Chart", to: "/org-chart", icon: Network },
    ],
  },
  {
    label: "Files",
    items: [
      { label: "Cloud Storage", to: "/files", icon: FolderOpen },
      { label: "Shared", to: "/files-shared", icon: Share },
      { label: "Version History", to: "/files-versions", icon: GitCommitHorizontal },
      { label: "Permissions", to: "/files-permissions", icon: Lock },
      { label: "CAD Viewer", to: "/cad-viewer", icon: FileCode },
      { label: "Backup", to: "/files-backup", icon: DatabaseBackup },
    ],
  },
  {
    label: "Email",
    items: [
      { label: "Inbox", to: "/mail", icon: Inbox },
      { label: "Sent", to: "/mail-sent", icon: SendHorizontal },
      { label: "Drafts", to: "/mail-drafts", icon: PenLine },
      { label: "Shared Mailboxes", to: "/mail-shared", icon: UsersAlt },
      { label: "Rules", to: "/mail-rules", icon: FilterAlt },
      { label: "Templates", to: "/mail-templates", icon: LayoutTemplate },
    ],
  },
  {
    label: "Development",
    items: [
      { label: "Code & Repos", to: "/repos", icon: GitBranch },
      { label: "Software", to: "/software", icon: Terminal },
      { label: "API Builder", to: "/api-builder", icon: Code2 },
      { label: "Integrations", to: "/it-integrations", icon: Plug },
      { label: "Infrastructure", to: "/it-servers", icon: Server },
      { label: "Security & Keys", to: "/it-security", icon: Shield },
      { label: "Monitoring & Logs", to: "/it-logs", icon: LogsIcon },
    ],
  },
  {
    label: "R&D",
    items: [
      { label: "Ideas", to: "/rd-ideas", icon: Lightbulb },
      { label: "Research Papers", to: "/rd-papers", icon: BookMarked },
      { label: "Material Database", to: "/rd-materials", icon: Database },
      { label: "Simulations", to: "/rd-simulations", icon: CircuitBoard },
      { label: "Patent Tracking", to: "/rd-patents", icon: Award },
    ],
  },
  {
    label: "Product",
    items: [
      { label: "Product Catalog", to: "/product-catalog", icon: ProdIcon },
      { label: "Features", to: "/product-features", icon: Sparkles },
      { label: "Release Planning", to: "/product-releases", icon: LaunchIcon },
      { label: "Lifecycle", to: "/product-lifecycle", icon: RefreshCw },
      { label: "Compatibility", to: "/product-compatibility", icon: Layers },
      { label: "Docs", to: "/product-docs", icon: BookText },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Dashboards", to: "/analytics", icon: BarChart3 },
      { label: "KPIs", to: "/kpis", icon: Target },
      { label: "Manufacturing", to: "/analytics-mfg", icon: Factory },
      { label: "Sales", to: "/analytics-sales", icon: LineChart },
      { label: "Finance", to: "/analytics-finance", icon: Landmark },
      { label: "Customer", to: "/analytics-customer", icon: Smile },
      { label: "Employee", to: "/analytics-employee", icon: Users },
      { label: "AI Insights", to: "/ai-insights", icon: Sparkle },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Workflows", to: "/workflows", icon: Workflow },
      { label: "Approvals", to: "/approvals", icon: ApprovalIcon },
      { label: "Scheduled Jobs", to: "/scheduled-jobs", icon: ScheduleIcon },
      { label: "Webhooks", to: "/webhooks", icon: Webhook },
      { label: "API Builder", to: "/api-builder", icon: Code2 },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users", to: "/admin/users", icon: Users, badge: "Admin" },
      { label: "Roles", to: "/admin/roles", icon: Shield, badge: "Admin" },
      { label: "Departments", to: "/admin/departments", icon: Building, badge: "Admin" },
      { label: "Company", to: "/admin/company", icon: Building2, badge: "Admin" },
      { label: "Branding", to: "/admin/branding", icon: BrandIcon, badge: "Admin" },
      { label: "Domains", to: "/admin/domains", icon: Globe2, badge: "Admin" },
      { label: "Security Policies", to: "/admin/security", icon: PolicyIcon, badge: "Admin" },
    ],
  },
  {
    label: "Future",
    items: [
      { label: "Factory Live", to: "/factory-live", icon: Radio },
      { label: "Digital Twin", to: "/digital-twin", icon: TwinIcon },
      { label: "Unified Timeline", to: "/timeline", icon: FileClock },
      { label: "Meeting Summaries", to: "/meeting-summaries", icon: Waypoints },
    ],
  },
];
