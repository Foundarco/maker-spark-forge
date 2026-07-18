# App-wide Redesign to Looplet Aesthetic

Goal: match the reference visually and structurally — dark navy sidebar, rounded pill search, blue/green accents, spacious feel, plus a browser-style record tabs bar and a 3-pane detail layout for record/list pages.

## 1. Design tokens (`src/styles.css`)

Rewrite the palette; keep semantic token names so shadcn components pick it up automatically.

- Primary: blue `oklch(0.55 0.20 260)` (~#2563eb) with `primary-foreground` white.
- Success/positive: green `oklch(0.65 0.17 155)` (~#16a34a) — used for the "Auto"/active pill, avatars.
- Sidebar: navy `oklch(0.19 0.03 260)` bg, near-white foreground, blue active pill, subtle hover `oklch(0.24 0.03 260)`.
- Surface: `oklch(0.985 0.005 260)` app background, pure white cards, border `oklch(0.92 0.01 260)`.
- Retire orange as primary. Keep it only as `--accent-warn` for badges (e.g. urgency).
- Density: bump base spacing — cards `p-6`, section gaps `gap-6`, table row height `h-12`, sidebar item `h-10`.
- Radius: `--radius: 0.75rem` (rounded-xl feel), pill controls `rounded-full`.

## 2. Sidebar rework (`src/components/hq/Sidebar.tsx`)

- Brand header: circular blue logo + "Clovr HQ" wordmark.
- Workspace switcher card directly below brand (avatar + name + role, chevron) — matches "Affordable fencing goldcoast" block.
- Search bar inside sidebar (`Search everything…` pill) with `⌘K` chip.
- Group headings uppercase, tracked, muted (`OVERVIEW`, `WORK`, `TEAM`, etc.) — reuse existing `nav-config` groups.
- Nav items: icon + label, `h-10`, rounded-lg, active state = filled blue pill with white text and left accent bar; hover = subtle white/5.
- Footer: "Customize sidebar", "Complete Setup" (progress link), "Help & Support", "Settings", then user card at very bottom with avatar, name, role, and menu.

## 3. Topbar + Tabs (`src/components/hq/Topbar.tsx` + new `RecordTabs.tsx`)

- Top strip becomes two rows:
  1. **Quick actions row** (thin): weather/status icons on left, `Quick Add`, phone, `Docbox` counter, apps grid, notifications, window controls on right — mirror the reference's chrome.
  2. **Tabs row**: browser-style record tabs. Dashboard is pinned; opening any record (contact, deal, ticket, meeting, PO, etc.) pushes a closable tab. `+` button opens quick-nav.
- Tabs are stored in a new `useRecordTabs` Zustand store (id, label, icon, route). Persist to localStorage per user.
- Global search moves into the sidebar; topbar keeps only the tab strip + right-side chrome.

## 4. Three-pane detail layout (new `RecordLayout.tsx`)

Reusable wrapper with slots: `<LeftContext>`, `<CenterContent>`, `<RightRail>`.

- Left pane (~360px): hero image/avatar block, contact/record details, quick action buttons (`Quote`, `Job`, `Form`, `Schedule` style), summary card, overview key/value grid.
- Center: main content (chat, form, table, kanban) with sticky action header (`Tour / Activity / Messaging / Configure` style segmented control) and a per-page toolbar (`Call`, `Video`, `Ask`).
- Right rail (~340px, collapsible): "Customer Journey" / activity feed, recent activity, related links — powered by an `activity_log` view we already write to.

Apply to:
- All record detail routes (contacts, leads, deals, tickets, meetings, POs, work orders, employees, projects).
- Messaging / DM / Customer Service inbox pages (chat in center, contact left, journey right).

## 5. List pages get a context rail

For list routes (`/employees`, `/tickets`, `/inventory`, etc.):
- Keep table/kanban as center, but add a collapsible right rail showing:
  - Selected row summary + quick actions.
  - Recent activity for the module.
  - Filters/saved views.
- When nothing selected, rail shows module-level insights (KPIs, recent changes).

## 6. Component polish

- Buttons: primary = solid blue, success = solid green, secondary = white with border, ghost = transparent. All `rounded-lg`, `h-9` default, `h-10` for hero CTAs.
- Segmented controls (Tour/Activity/Messaging/Configure): new `SegmentedTabs` component, pill-shaped, blue active.
- Status pills: colored dot + label (green=Active, blue=New Lead, amber=Pending, red=Blocked).
- Tables: zebra off, subtle row hover, larger padding (`py-3.5`), sticky header with muted bg.
- Cards: `rounded-2xl`, `border`, `shadow-sm`, generous inner padding.
- Empty states: illustration slot + heading + subtext + CTA.

## 7. Rollout

1. Tokens + shell (sidebar, topbar, tabs, shell wrapper).
2. New `RecordLayout` + `SegmentedTabs` + `StatusPill` primitives.
3. Migrate high-traffic pages: Dashboard, People, Contacts, Deals, Tickets, Meetings, DM, one PO/WorkOrder.
4. Migrate remaining record + list pages incrementally; `ResourcePage` gets a new `layout="three-pane"` mode so most pages update by config.
5. Remove orange primary references sitewide (search for `primary` overrides / hardcoded oranges); verify dark-mode contrast.

## Technical notes

- No route changes; only shell + layout + tokens.
- New files: `src/components/hq/RecordTabs.tsx`, `RecordLayout.tsx`, `SegmentedTabs.tsx`, `StatusPill.tsx`, `ContextRail.tsx`, `src/stores/recordTabs.ts`.
- `ResourcePage.tsx` extended, not rewritten — adds optional `renderLeftContext`, `renderRightRail`, `detailRoute` props.
- `nav-config.ts` unchanged (structure already matches the reference's grouped sidebar).
- Activity rail reads from existing `activity_log` / per-module event tables; add a `useActivityFeed(entityType, entityId)` hook.
- All color changes go through tokens — no hardcoded hex in components.
