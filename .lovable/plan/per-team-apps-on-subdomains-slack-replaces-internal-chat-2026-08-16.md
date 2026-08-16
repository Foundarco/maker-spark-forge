# Per-Team Apps on Subdomains + Slack Replaces Internal Chat

## Short answer: yes, this works

One codebase, one deploy, one database — but each subdomain boots its own app:
its own name, sidebar, home page, and set of pages. `eng.clovrlab.com` looks and
behaves like an Engineering product; `ops.clovrlab.com` like a Mission Ops
product. Nothing is cramped together, and there is only one place to fix bugs.

The one external step you have to do yourself: each subdomain must be pointed at
this project in domain settings (a DNS record per subdomain, or a wildcard if
your DNS provider and the hosting side allow it). Until that's done, everything
is testable through the existing HQ domain.

## The eight apps

| Subdomain | App |
|---|---|
| exec | Executive |
| product | Product & Program |
| eng | Engineering |
| mfg | Manufacturing |
| ops | Field / Mission Operations |
| systems | Software & Enterprise Systems |
| commercial | Commercial |
| admin | Operations & Administration |

`hq.clovrlab.com` stays as the shared home: dashboard, people, files, calendar,
settings, and a launcher showing every app you're allowed into.

## How access works

Sign-in is gated per app. When you land on a team subdomain:

1. Not signed in -> login screen branded for that app.
2. Signed in, but no role in that division -> you don't get in. A clean
   "You don't have access to Engineering" screen listing the apps you *can*
   open, one click away.
3. Signed in with a role there -> full workspace, and what you can do inside is
   still filtered by your existing page permissions and per-person overrides.

Admins get every app.

## Controlled from Enterprise Systems

A new **Apps** page under Enterprise Systems where an admin can:

- see every app, its subdomain, its linked division, and whether it's live
- enable/disable an app (disabled = subdomain shows "coming soon")
- choose which page groups appear in that app's sidebar
- set the app's landing page and display name
- add a new app + subdomain without a code change
- see who currently has access to each app

## Internal messaging out, Slack in

Removed from the internal side: Channels, direct messages, and in-meeting chat
disappear from navigation, and those routes redirect to the dashboard. Existing
data stays in the database, untouched, so nothing is lost.

Kept: everything customer/partner facing — Partner Comms, Live Chat, the client
portal messages, and the sales/support inbox. Those stay exactly as they are.

Added: Slack hooks. A Slack section in Enterprise Systems where you set your
workspace URL and map a Slack channel per team; then "Open in Slack" buttons
appear on team workspaces and record pages instead of the old chat. Actual
message-posting into Slack (notifications for incidents, approvals, mentions)
is a follow-up once the workspace is connected — I'll flag it rather than
half-build it.

## Technical notes

- **App registry table** (`org_apps`): slug, subdomain, `org_unit_id`, label,
  tagline, icon, landing route, enabled flag, allowed nav groups. Seeded with
  the eight divisions + the shared HQ app. Admin-managed, readable by
  authenticated users. GRANTs + RLS included in the migration.
- **App resolution**: a `useCurrentApp()` provider resolves the app from
  `window.location.hostname` (first label before the root domain), with a
  `?app=` override for local/preview testing where subdomains don't exist. The
  `_hq` layout reads it and feeds nav + branding.
- **Nav filtering**: `nav-config.ts` gains a division tag per group (mostly
  present already); the sidebar renders only the groups the current app allows,
  intersected with `my_access()` route permissions. Core/personal pages stay
  visible in every app.
- **Access gate**: extend the `my_access()` RPC to also return the caller's
  `org_unit_id` ancestry, so the `_hq` `beforeLoad` can check
  "does this user hold a role in this app's division subtree" and redirect to a
  new `/no-access` screen otherwise.
- **Launcher**: the existing apps-launcher dots become the real app switcher,
  listing permitted apps and linking across subdomains (absolute URLs, which
  keeps the Supabase session per-subdomain — each app requires its own sign-in
  once unless a shared cookie domain is configured later; I'll note this rather
  than assume it).
- **Messaging removal**: drop `/channels`, `/dm` and meeting chat from
  `nav-config.ts`, `CommsRail.tsx`, and the always-visible/baseline route sets in
  `route-access.ts`; convert the route files to redirects. Client-facing comms
  files are left alone.
- **Slack settings**: stored in `admin_settings`; link-out only in this phase.

## Build order

1. App registry table + `useCurrentApp()` + subdomain resolution (testable via `?app=`).
2. Per-app sidebar, branding, landing page, and the no-access screen.
3. Access gate in `_hq` + app switcher in the launcher.
4. Enterprise Systems > Apps admin page.
5. Internal messaging removal + Slack link-out settings.
6. Domain wiring: you add the subdomains, I verify each app resolves.
