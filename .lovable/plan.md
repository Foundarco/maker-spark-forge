# Plan: Meetings + Messaging + Channels/Roles

Large batch — implemented in one migration plus focused UI edits. Best-effort polish; follow-ups likely.

## 1. Database migration

New tables (all with GRANTs + RLS):
- `custom_roles` — id, name, color, position (int), permissions (jsonb: `{manage_channels, manage_roles, manage_messages, admin}`), created_by, timestamps.
- `user_custom_roles` — user_id, role_id (unique pair).
- `channel_categories` — id, name, position, is_private, created_by.
- `channel_category_members` — category_id, user_id | role_id (one non-null).
- `channel_role_access` — channel_id, role_id (for private-channel role grants).
- Alter `channels`: add `category_id`, `position`.
- Alter `channel_messages` + `direct_messages`: add `edited_at`, `deleted_at`, `attachments jsonb[]` (array of `{url, type, name, size}`), `reply_to_id`.
- New `message_attachments` bucket (public, 25MB cap enforced client-side).
- Alter `meetings`: add `ended_at`, `ended_by`.
- Alter `meeting_notes`: add `content_md` (richer markdown notes).

Helper security-definer functions:
- `has_role_permission(_user, _perm text)` → checks any assigned role has permission true.
- `can_access_channel(_user, _channel)` → owner, member, or has granted role.

RLS updates:
- Channel create/update/delete gated by `has_role_permission(auth.uid(),'manage_channels')`.
- Category CRUD same gate.
- Custom roles CRUD gated by `has_role_permission(auth.uid(),'manage_roles')` or super_admin.
- Messages: only sender can edit/soft-delete; deletion sets `deleted_at` + clears body ("message deleted").

## 2. Meetings polish (`src/routes/meeting.$id.tsx`)
- Active speaker detection via `AudioContext` analyser on each remote/local stream; highlight tile (ring + name badge glow) and bump z-index/scale.
- Leave button: if user is meeting host, show confirm dialog "End meeting for everyone / Just leave / Cancel". End for everyone → mark `ended_at`, delete row (cascade), auto-generate polished markdown meeting notes from chat log + participant list + duration.
- Meeting notes generator: structured sections — Summary, Attendees, Duration, Chat highlights, Action items placeholder.

## 3. Calendar (`src/routes/_hq.calendar.tsx`)
- Add month view with event dots, click day → drawer with events list, event details modal (attendees, location, join link, description). Color-coded event types.

## 4. Messages upgrades (DMs + channels)
- New `MessageComposer` component: textarea + emoji picker (emoji-mart lite), attach button (image/video/file), link paste detection.
- Message rendering: avatar (from profile), sender name clickable → profile popover (name, email, department, roles). Show edited/deleted state.
- Right-click / hover menu: Edit (own), Delete (own or manage_messages), Reply, React.
- Link preview: simple detection + clickable anchors.
- Attachments render inline (img/video/file card).

## 5. Channels UI (`src/routes/_hq.channels.tsx`)
- Sidebar grouped by category (collapsible). Categories/channels ordered by `position`.
- Admin panel (gear on category/channel) — create/edit/delete when `manage_channels`.
- Private channel access dialog: add users or roles.
- Roles panel (`/admin/roles` route already exists — enhance): list roles in position order, drag-to-reorder, color picker, permission toggles, member assign.

## 6. Files touched
- `supabase/migrations/<new>.sql` (single migration)
- `src/components/hq/MessageComposer.tsx` (new)
- `src/components/hq/MessageItem.tsx` (new — shared user + channel)
- `src/components/hq/EmojiPicker.tsx` (new, small)
- `src/components/hq/ProfilePopover.tsx` (new)
- `src/components/hq/CategoryTree.tsx` (new)
- `src/routes/_hq.dm.tsx` (rewire to new components)
- `src/routes/_hq.channels.tsx` (categories + admin gating + composer)
- `src/routes/_hq.admin.roles.tsx` (full roles CRUD + reorder)
- `src/routes/_hq.calendar.tsx` (detailed month view)
- `src/routes/meeting.$id.tsx` (active speaker, end-meeting confirm, notes gen)
- `src/routes/_hq.meetings.tsx` (hide ended meetings)
- `src/lib/hq/meeting-notes.ts` (new — notes generator)
- `src/lib/hq/permissions.ts` (new — client permission helpers)

## Technical notes
- Emoji picker: use `@emoji-mart/react` + `@emoji-mart/data` (bun add).
- Storage bucket `message-attachments` created via `storage_create_bucket` tool + RLS on `storage.objects`.
- Active speaker: single shared `AudioContext`, one analyser per stream, RAF loop diffing RMS thresholds.
- Meeting notes auto-generation runs in `endMeeting` handler before deleting meeting row; inserts into `meeting_notes` with `content_md`.

Approve to proceed, or say what to trim.
