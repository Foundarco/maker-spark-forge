
## Goals

1. Ship a light-first UI matching the Looplet reference while keeping a working dark toggle.
2. Slate → blue gradient sidebar that can fully hide and re-open via a floating trigger.
3. Reusable 3-pane "record" layout (left profile rail + center canvas + right activity/journey rail) applied to CS, CRM, and People.
4. New internal `/help` page linked from the sidebar footer.
5. Tighten the sidebar header (drop "Clovr HQ", keep the workspace card only) and wire everything so it actually functions.

---

## 1. Theme — light default, dark toggle preserved

- `src/lib/hq/theme.ts`: change `getStoredTheme()` fallback from `"dark"` to `"light"`; keep `system` + `dark` options.
- `src/components/hq/HQShell.tsx`: remove the forced `dark` cleanup on unmount; just `applyTheme(getStoredTheme())`.
- `src/styles.css`:
  - Rework `:root` (light) tokens to match the reference:
    - `--background`: near-white `oklch(0.99 0.003 260)`
    - `--surface`: soft blue-tinted panel `oklch(0.975 0.006 250)`
    - `--card`: pure white
    - `--primary`: reference blue `oklch(0.58 0.19 260)`
    - `--success`: reference green `oklch(0.68 0.16 155)`
    - `--muted-foreground`, borders, rings tuned for airy light UI.
  - Keep `.dark` block intact.
  - Confirm `Sidebar` is uncoupled from light/dark (its tokens are always the navy gradient — see §2).

## 2. Sidebar — slate → blue gradient + floating collapse

- Update `--sidebar-*` tokens in `src/styles.css`:
  - Introduce `--sidebar-gradient: linear-gradient(180deg, #0f172a 0%, #1e293b 45%, #1e3a5f 80%, #2563eb 140%)`.
  - `--sidebar-accent` stays the reference blue for active pills.
- `src/components/hq/Sidebar.tsx`:
  - Remove the top "Clovr HQ + Sparkles" brand row entirely; the workspace card ("Clovr Lab / Internal Workspace") becomes the top element with a small collapse chevron on its right.
  - Apply `background: var(--sidebar-gradient)` on the nav root.
  - "Help & Support" footer link → `to="/help"` (currently points at `/settings`).
- `src/components/hq/HQShell.tsx`:
  - Add persistent collapsed state (`hq.sidebar.hidden` in localStorage) with a `useSidebarVisibility()` helper.
  - When hidden, the `<aside>` slides offscreen (`-translate-x-full`) with a transition; render a floating pill button `fixed left-3 top-3 z-40` with a chevron-right icon to re-open. When visible, put a chevron-left button inside the sidebar (top-right of workspace card) to hide.
  - Mobile drawer behavior unchanged.

## 3. Reusable 3-pane RecordLayout

New file `src/components/hq/RecordLayout.tsx`:

```text
┌─────────────┬───────────────────────────┬────────────────┐
│ ProfileRail │ Main (children)           │ ActivityRail   │
│  ~320px     │  flex-1                   │  ~320px        │
└─────────────┴───────────────────────────┴────────────────┘
```

- Props: `profile: ReactNode`, `activity?: ReactNode`, `header?: ReactNode`, `children`.
- Rails collapsible via chevron toggles; state stored per-module in localStorage (`hq.record.<module>.left|right`).
- On < 1280px the activity rail auto-hides; < 1024px both rails become sheets.
- Ships two building-block components:
  - `<ProfileCard>` — avatar, name, tags, contact block, quick-action grid (Call / Message / Email / Schedule), mini KPI list.
  - `<ActivityRail>` — tabbed (Journey / Pipeline / Timeline) with a scrollable event feed; feeds accept `{ icon, title, meta, timestamp }[]`.

## 4. Apply RecordLayout to the requested modules

Add a lightweight `useRecord(id)` hook per module that fetches the record + related activity via Supabase, then wrap the existing detail views:

- **Customer Service** — `_hq.tickets.tsx`, `_hq.live-chat.tsx`, `_hq.rma.tsx`, `_hq.repairs.tsx`, `_hq.warranty-claims.tsx`, `_hq.customer-timeline.tsx`:
  - Left rail = contact card (from `contacts` / `hr_employees` link) with quick-action buttons; center = existing ResourcePage detail; right rail = ticket/comment history + status changes.
- **CRM** — `_hq.leads.tsx`, `_hq.pipeline.tsx`, `_hq.crm.tsx`:
  - Left rail = lead/deal card with stage badge, owner (via `<UserMention>`), value; right rail = pipeline history + notes.
- **People** — `_hq.employees.tsx` employee detail:
  - Left rail = employee profile (avatar, department, manager via `<UserMention>`, start date); right rail = onboarding progress + recent time entries + reviews.
- ResourcePage gets an optional `renderDetail?: (row) => { profile, activity, main }` prop; when set, opening a row renders inside `<RecordLayout>` instead of the current side sheet.

## 5. Help & Support page

New file `src/routes/_hq.help.tsx`:
- Head: title "Help & Support — Clovr HQ", robots noindex.
- Sections:
  1. **Quick self-serve** — cards: Reset password (links to `/hq-login?reset=1`), Update profile (`/profile`), Change theme (`/settings`), Manage notifications (`/notifications`).
  2. **Internal docs** — searchable list backed by existing `hr_policies` + a new `kind = 'internal_doc'` filter on `cs_kb_articles` (no new table). Seed a handful of starter docs via migration: "How to use HQ", "Reset your password", "Book a meeting", "Request time off", "Report an outage".
  3. **Contact Operations** — form (`support_tickets` new row w/ `category = 'ops_support'`) with subject, priority, description, urgency; submit calls a new `createServerFn` `submitOpsSupport` that inserts the row and DMs the on-call ops user (config: `admin_settings.ops_support_user_id`). Shows current on-call `<UserMention>` if set.
- Sidebar footer "Help & Support" link updated to `to="/help"`.

## 6. Wiring / polish

- Topbar: verify search + quick add still work in light mode; adjust border/ring colors that assumed dark bg.
- Any `text-white`/`bg-black` regressions from earlier iterations are replaced with semantic tokens.
- Save a memory rule: "HQ default theme is light; sidebar is always the navy→blue gradient regardless of theme."

## Technical notes

- No schema changes required beyond:
  - `admin_settings` row `ops_support_user_id uuid`.
  - Optional seed inserts into `cs_kb_articles` for internal docs.
- All new server work uses `createServerFn` under `src/lib/hq/*.functions.ts` with `requireSupabaseAuth`.
- RecordLayout is presentation-only; data still flows through existing Supabase queries so no RLS changes needed.

## Out of scope (call out for a follow-up)

- Migrating every ResourcePage to the 3-pane layout — only the modules listed in §4 in this pass.
- Rebuilding the composer/messaging pane to look pixel-identical to Looplet (chat bubbles keep current styling).
