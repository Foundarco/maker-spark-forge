
# HQ Internal App — Phase 1 Scaffold

Builds the internal operations app at **hq.clovrlab.com** inside the existing project. Marketing site keeps serving clovrlab.com / www.clovrlab.com. The full module list from your spec becomes a fully navigable app with stubbed pages, ready to be fleshed out module-by-module later.

## Approach

- **Single project, subdomain-routed.** The root route (`__root.tsx`) detects `hq.clovrlab.com` (and the preview equivalent) and renders the HQ app shell. Everything else renders the current marketing site untouched. No URL prefix like `/hq/` — HQ users see clean paths (`/`, `/projects`, `/inventory`, etc.) on hq.clovrlab.com.
- **Invite-only auth.** No public signup. Admins create accounts by email invite. Sign-in via email/password on hq.clovrlab.com only. Marketing site keeps no auth.
- **Roles & permissions.** Separate `user_roles` table + security-definer `has_role()` (per platform rules — no roles on profiles). Seeded roles: `super_admin`, `admin`, `manager`, `employee`, plus per-department roles (`engineering`, `manufacturing`, `sales`, `finance`, `hr`, `it`, `support`, `marketing`). First user promoted to `super_admin` manually via SQL after signup.
- **Stub-first modules.** Every item in your feature list gets a route with a consistent "module placeholder" layout: title, description, a "Coming in a future phase" banner, and empty state. This lets you click through the whole app immediately and prioritize which modules to build for real next.
- **Global AI chat.** Floating assistant panel (bottom-right) available on every HQ page. Uses Lovable AI Gateway (`google/gemini-3-flash-preview`) via a server function. Aware of the current page/module for context. No cross-module data yet — that comes once real data exists.

## Subdomain routing

`__root.tsx` reads `window.location.hostname` (client) / request host (SSR). If host is `hq.clovrlab.com` or `hq--*.lovable.app` (preview) → render `<HQShell>` around `<Outlet />`. Otherwise → current marketing `<Header/> + <Outlet/> + <Footer/>`.

Routes live under a pathless `_hq` layout (`src/routes/_hq/...`) whose `beforeLoad` (a) confirms host is HQ, (b) checks Supabase session, (c) redirects to `/hq-login` if not authenticated. Marketing routes stay top-level. `/hq-login` is a top-level route only reachable on the HQ subdomain.

Custom-domain setup: you'll add `hq.clovrlab.com` in Lovable's domains panel once merged; the code already routes for it.

## Database (one migration)

New tables (all with RLS + GRANTs):

- `profiles` (id → auth.users, full_name, avatar_url, department, title, phone, created_at)
- `app_role` enum + `user_roles` (user_id, role) with `has_role()` security-definer fn
- `invites` (email, role, department, token, invited_by, expires_at, accepted_at)
- `notifications` (user_id, title, body, link, read_at, created_at)
- `announcements` (author_id, title, body, published_at)
- `activity_log` (actor_id, module, action, entity_type, entity_id, metadata, created_at) — the "unified activity timeline" foundation

Trigger: on `auth.users` insert → create `profiles` row + assign role from matching `invites` row (or throw if no invite → enforces invite-only).

## HQ App Shell

`src/components/hq/`:
- `HQShell.tsx` — sidebar + topbar + `<Outlet/>` + AI chat FAB
- `Sidebar.tsx` — collapsible groups matching your feature list (Core, Communication, Engineering, Manufacturing, Customer Service, Sales, Finance, Marketing, Business, HR, Files, Email, IT, Supply Chain, R&D, Product, Analytics, Automation, Administration)
- `Topbar.tsx` — universal search input (stub), notifications bell, profile menu
- `ModulePlaceholder.tsx` — shared stub layout used by every non-built module
- `AIAssistant.tsx` — floating chat panel, sends to `/api/hq/assistant` server route

## AI Assistant

- Server route: `src/routes/api/hq/assistant.ts` — `streamText` via AI SDK, Lovable AI Gateway provider, `google/gemini-3-flash-preview`. System prompt: "You are the Clovr HQ assistant. The user is on module {module}. Help with operations questions."
- Client: AI Elements (`Conversation`, `Message`, `MessageResponse`, `PromptInput`) inside a slide-over panel. Threaded conversations, localStorage persistence (per user).
- Requires bearer middleware (already registered) — protected server route wrapper via `requireSupabaseAuth`, called from a server function invoked by the panel.

## Stub pages generated (grouped as in your spec)

Every listed feature becomes a route file rendering `<ModulePlaceholder module="…" description="…" />`. Grouped route files:

- **Core:** `/` (dashboard — real), `/notifications`, `/search`, `/assistant`, `/profile`, `/admin/roles`, `/settings`
- **Communication:** `/chat`, `/chat/dm`, `/chat/channels`, `/calls`, `/meetings`, `/announcements`, `/feed`, `/calendar`, `/contacts`
- **Engineering:** `/projects`, `/tasks`, `/kanban`, `/gantt`, `/milestones`, `/cad`, `/pcb`, `/firmware`, `/repos`, `/docs`, `/bom`, `/eco`, `/design-reviews`, `/version-control`, `/prototypes`, `/lab-notebook`, `/test-reports`, `/issues`
- **Manufacturing:** `/production`, `/work-orders`, `/assembly`, `/inventory`, `/warehouse`, `/purchase-orders`, `/receiving`, `/qc`, `/machines`, `/maintenance`, `/calibration`, `/serials`, `/packaging`, `/shipping-prep`
- **Customer Service:** `/tickets`, `/live-chat`, `/email-support`, `/phone-logs`, `/warranty`, `/rma`, `/kb`, `/support-faqs`, `/customers/timeline`, `/csat`, `/diagnostics`, `/repairs`
- **Sales:** `/quotes`, `/orders`, `/crm`, `/pipeline`, `/leads`, `/sales-contacts`, `/contracts`, `/accounts`, `/discounts`, `/pricing`, `/sales-analytics`
- **Finance:** `/accounting`, `/payroll`, `/invoices`, `/expenses`, `/budgets`, `/purchasing`, `/banking`, `/taxes`, `/financial-reports`, `/forecasting`, `/pnl`, `/balance-sheet` — each carries a banner: "Financial/tax logic — review with your bookkeeper before use."
- **Marketing:** `/cms`, `/marketing-blog`, `/email-campaigns`, `/social`, `/content-calendar`, `/brand-assets`, `/marketing-analytics`, `/press-releases`, `/launches`, `/media-library`
- **Business:** `/goals`, `/roadmap`, `/okrs`, `/meetings/notes`, `/partnerships`, `/investors`, `/legal-docs`, `/policies`, `/strategy`, `/decision-log`
- **HR:** `/employees`, `/hiring`, `/applicants`, `/interviews`, `/onboarding`, `/training`, `/time-off`, `/time-tracking`, `/reviews`, `/benefits`, `/org-chart`
- **Files:** `/files`, `/files/shared`, `/files/versions`, `/files/permissions`, `/files/cad-viewer`, `/files/backup`
- **Email:** `/mail`, `/mail/sent`, `/mail/drafts`, `/mail/shared`, `/mail/rules`, `/mail/templates`
- **IT:** `/it/devices`, `/it/servers`, `/it/network`, `/it/api-keys`, `/it/integrations`, `/it/security`, `/it/backups`, `/it/logs`, `/it/monitoring`, `/it/sso`, `/it/audit`
- **Supply Chain:** `/suppliers`, `/vendor-portal`, `/rfqs`, `/vendor-quotes`, `/purchase-history`, `/lead-times`, `/approved-vendors`, `/shipping-tracking`
- **R&D:** `/rd/ideas`, `/rd/experiments`, `/rd/papers`, `/rd/materials`, `/rd/test-data`, `/rd/simulations`, `/rd/patents`
- **Product:** `/products`, `/products/features`, `/products/releases`, `/products/lifecycle`, `/products/compatibility`, `/products/docs`
- **Analytics:** `/analytics`, `/analytics/kpis`, `/analytics/mfg`, `/analytics/sales`, `/analytics/finance`, `/analytics/customer`, `/analytics/employee`, `/analytics/ai-insights`
- **Automation:** `/workflows`, `/approvals`, `/scheduled-jobs`, `/webhooks`, `/api-builder`
- **Administration:** `/admin/users`, `/admin/permissions`, `/admin/departments`, `/admin/company`, `/admin/branding`, `/admin/domains`, `/admin/security-policies`
- **Long-term wow (stubbed with descriptions):** `/factory-live`, `/digital-twin`, `/timeline`, `/meeting-summaries`

Real (not stub) in this phase: dashboard, profile, notifications list, announcements list, admin/users invite form, admin/roles assignment, AI assistant.

## Technical notes

- No changes to marketing routes, `Header.tsx`, `Footer.tsx`, `index.tsx`, or existing store/blog routes.
- All HQ routes under `_hq/` pathless layout with `ssr: false` (Supabase session lives in localStorage).
- Role-gated routes (`/admin/*`, `/finance/*`) use nested `_hq/_admin` / `_hq/_finance` layouts calling `has_role()`.
- Bearer middleware already registered in `src/start.ts`; server functions use `requireSupabaseAuth`.
- Sidebar groups collapsible with localStorage persistence.
- Every module page follows `ModulePlaceholder` contract so replacing a stub with a real implementation later is a one-file change.
- Financial pages carry a visible bookkeeper-review banner (per your spec).

## What I'll deliver in the build turn

1. One DB migration (tables + RLS + roles + invites trigger).
2. `configure_auth` — disable public signup.
3. HQ shell components + subdomain routing in `__root.tsx`.
4. `_hq` layout + `_hq/_admin` layout + all module route files.
5. AI assistant server route + client panel.
6. Admin invite/users pages (real).
7. Dashboard with placeholder KPI cards + activity feed reading `activity_log`.

## What I'm NOT doing yet

- Wiring `hq.clovrlab.com` in the Lovable domains panel (you'll do that in Settings once merged; the code is ready).
- Building real functionality for any non-Core module.
- Seeding demo data beyond what's needed to click through.
- Payments, real email sending, real chat/voice/video, real CAD viewing.

Approve and I'll build it.
