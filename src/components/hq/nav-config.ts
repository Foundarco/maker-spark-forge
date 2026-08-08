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
  HardDrive, Share, Lock, FileCode,
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
      { label: "Email", to: "/mail", icon: Inbox },
      { label: "Communication", to: "/channels", icon: Hash },
      { label: "Calendar", to: "/calendar", icon: Calendar },
      { label: "Drive", to: "/drive", icon: HardDrive },
      { label: "Ideas", to: "/rd-ideas", icon: Lightbulb },
    ],
  },
  {
    label: "Product Team",
    items: [
      { label: "Projects", to: "/eng-projects", icon: FolderKanban },
      { label: "Tasks & Boards", to: "/tasks", icon: CheckSquare },
      { label: "Milestones & Roadmap", to: "/milestones", icon: Flag },
      { label: "Design & CAD Library", to: "/cad", icon: FileBox },
      { label: "Firmware & Repos", to: "/firmware", icon: Cpu },
      { label: "BOM & Change Orders", to: "/bom", icon: ListTree },
      { label: "Reviews & Testing", to: "/design-reviews", icon: Eye },
      { label: "Issues", to: "/issues", icon: Bug },
      { label: "Product Catalog", to: "/product-catalog", icon: ProdIcon },
      { label: "Features & Compatibility", to: "/product-features", icon: Sparkles },
      { label: "Documentation", to: "/docs", icon: BookText },
      { label: "Assembly Floor · Live", to: "/factory-live", icon: Activity },
      { label: "Production & Work Orders", to: "/production", icon: Factory },
      { label: "Inventory & Warehouse", to: "/inventory", icon: Boxes },
      { label: "Quality & Machines", to: "/qc", icon: ShieldCheck },
      { label: "Packaging & Shipping", to: "/packaging", icon: Package },
      { label: "Suppliers & Purchasing", to: "/suppliers", icon: Store },
      { label: "Shipping Tracking", to: "/shipping-tracking", icon: MapPin },
      { label: "Code & Repos", to: "/repos", icon: GitBranch },
      { label: "Software & APIs", to: "/software-apis", icon: Terminal },
      { label: "Integrations", to: "/it-integrations", icon: Plug },
      { label: "Infrastructure & Monitoring", to: "/it-servers", icon: Server },
      { label: "Security & Logs", to: "/it-security", icon: Shield },
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
    label: "Growth Team",
    items: [
      { label: "Pipeline & CRM", to: "/pipeline", icon: Filter },
      { label: "Orders & Contracts", to: "/orders", icon: Receipt },
      { label: "Invoices & Payments", to: "/invoices", icon: FileSpreadsheet },
      { label: "Accounting & Expenses", to: "/accounting", icon: Landmark },
      { label: "Taxes & Reports", to: "/financial-reports", icon: FileBarChart },
      { label: "Website & Campaigns", to: "/cms", icon: Globe },
      { label: "Brand & Launches", to: "/brand-assets", icon: Palette },
      { label: "Growth Analytics", to: "/sales-analytics", icon: LineChart },
      { label: "Goals & Roadmap", to: "/goals", icon: Target },
      { label: "Partnerships & Investors", to: "/partnerships", icon: Handshake },
      { label: "Legal & Strategy", to: "/legal-docs", icon: Gavel },
    ],
  },
  {
    label: "Operations Team",
    items: [
      { label: "People", to: "/employees", icon: IdCard },
      { label: "Hiring", to: "/hiring", icon: UserSearch },
      { label: "Time & Attendance", to: "/time-tracking", icon: Clock },
      { label: "Performance & Benefits", to: "/reviews", icon: Star },
      { label: "Org Chart", to: "/org-chart", icon: Network },
      { label: "Dashboards", to: "/analytics", icon: BarChart3 },
      { label: "Company Settings", to: "/admin/company", icon: Settings, badge: "Admin" },
    ],
  },
];
