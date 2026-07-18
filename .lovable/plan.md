# Big update — 5 workstreams

Shipping in this order so each phase leaves the app usable.

## 1. @Mentions + notification sounds (small, high value)

- Channel & DM composer: `@` triggers a user picker (searches `profiles`). Mentions stored as `@[Name](user_id)` markdown, rendered via `UserMention`.
- On send: parse mentions → insert rows into `notifications` (`title`, `body`, `link` to the channel/DM).
- `SoundNotifier` already plays site-wide sounds on `notifications` inserts and DM inserts — extend to detect if the current user is `@mentioned` in a `channel_messages` row and play the higher-priority "ping" sound + browser Notification (with permission prompt on first mention).
- Add unread badge counts in the sidebar for Communication.

## 2. Google Drive-style Drive

- Rename nav entry "Cloud Storage" → "Drive". Rebuild `_hq.files.tsx`.
- New table `drive_items` (folder or file, `parent_id`, `owner_id`, `starred`, `trashed`, `mime_type`, `size_bytes`, `storage_path`).
- New table `drive_shares` (`item_id`, `user_id | role_id`, `permission: view|comment|edit`).
- Storage bucket `drive` (private) — real uploads via `supabase.storage.from('drive').upload()`.
- UI: left nav (My Drive / Shared with me / Starred / Recent / Trash), breadcrumb, folder tree, grid/list toggle, drag-and-drop upload, right-click menu (rename, move, share, star, download, delete), share dialog picking users/roles + permission level.
- Previews: images + PDFs inline; other types show icon + download.

## 3. Role-aware Dashboard

- Rebuild `_hq.dashboard.tsx` as a 3-column layout.
- Detects user's roles (`user_roles` + `user_custom_roles`) and renders relevant KPI cards:
  - Growth: open deals, pipeline value, MRR, new leads this week, invoices due.
  - Product: open issues, active work orders, tasks in progress, inventory low-stock.
  - Operations: pending onboarding, time-off requests, open tickets.
  - Everyone: my tasks, my meetings today, my unread mentions.
- Right rail: Today's meetings (with RSVPs), unread channels/DMs, mentions & pings feed.
- All data fetched via `useSuspenseQuery` per-section so partial failures don't break the page.

## 4. AI Assistant that actually knows the workspace

- Give the assistant tools (AI SDK `tool()` calls) — server-side, running under `requireSupabaseAuth` so every query respects RLS:
  - `search_people(query)` → profiles/employees
  - `search_channels(query)` → recent channel messages
  - `list_my_meetings(range)` → upcoming meetings
  - `list_my_tasks()` → open tasks/issues assigned to me
  - `search_deals(query)`, `search_tickets(query)`, `search_files(query)`
  - `draft_email({to, subject, purpose})` → returns markdown draft, does NOT send
  - `draft_announcement`, `draft_meeting_notes`
- System prompt loaded with: current user profile, their roles, current module, current date.
- Streaming preserved; multi-step reasoning up to 8 tool calls.

## 5. Email system finish

- Resend inbound webhook: already wired; verify signature check and expand event handling (already handles 11 event types — audit).
- **Per-user email settings** (new tab on `/profile`):
  - display_name, signature (markdown), auto-reply on/off + text, notification prefs (per-thread, mentions only, digest).
- **Company admin email settings** (new tab on `/admin/company`):
  - sender_domain, from_name, default footer, click/open tracking toggles, default reply-to.
- **Templates management** (`/admin/email-templates`): CRUD on `hq_email_templates` with variable placeholders (`{{name}}`, `{{company}}`), preview pane, test-send.
- **Suppression list** (`/admin/email-suppression`): view bounced/complained/unsubscribed; call `email_domain--check_email_suppression` + button to resubscribe (removes from local suppression cache; Lovable still enforces global rules).

## Technical notes (per file)

- Migration bundling: one migration for `drive_items`, `drive_shares`, storage bucket policies, `user_email_settings`, `company_email_settings`, plus RLS + GRANTs.
- Assistant tools live in `src/routes/api/hq/assistant.ts` using `experimental_tool` from AI SDK, with each tool's `execute` doing a Supabase query using the request's bearer token.
- Mention parser: shared util `src/lib/hq/mentions.ts` (parse + render + notify).
- Sidebar badges use a lightweight `useUnreadCounts()` hook subscribing to realtime.
- No new third-party packages required.

## Delivery order this turn

I'll do **Phase 1 (mentions + sounds) + Phase 2 (Drive) + start Phase 3 (dashboard skeleton)** in this turn. Phases 4 (assistant tools) and 5 (email settings + templates) in a follow-up turn — they each add ~15–20 files and I'd rather ship each one solid than half of everything.

Sound good?