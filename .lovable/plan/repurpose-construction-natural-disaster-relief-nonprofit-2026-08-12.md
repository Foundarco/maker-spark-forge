# Repurpose: Construction → Natural-Disaster Relief Nonprofit

## What's here today

**Public site (`.site-theme` scoped)** — 20+ routes: `/`, `/services`, `/projects`, `/process`, `/about`, `/divisions` + `/divisions/$slug`, `/careers`, `/blog`, `/faq`, `/help`, `/contact`, `/legal/*`, `/sitemap.xml`. Content is centralized in three typed data modules: `src/config/brand.ts` (McGuire identity, 1974, phone/email/values), `src/config/site-content.ts` (services, projects), `src/config/divisions.ts` (five construction divisions with accents/stats/images). Shared components in `src/components/site/`: Header (mega-menu + announcement strip), Footer, Section/SectionHeading/DisplayHeading, CTAButton, Card, CountUp, Reveal (scroll-fade), BrandLogo, Placeholder. Imagery is 15 `mg-*` / `mg2-*` construction photos as CDN asset JSON.

**Internal HQ (`/_hq/*`)** — ~85 routes across Core, Sales & Preconstruction, Field Ops, Materials, Clients, Finance, People, driven by `src/components/hq/nav-config.ts`. The platform layer is genuinely valuable and domain-agnostic: HQShell, gradient navy Sidebar, Topbar, RecordTabs (browser-style tabs), RecordLayout (3-pane record view), ResourcePage (generic CRUD + KPI table engine), ContextThread, CommsRail, UserMention/ProfilePopover, MessageComposer/Reactions/Mentions, phone/WebRTC, IMAP/SMTP mail stack, Drive, meetings + auto-notes, RBAC (`permissions.ts`, `route-access.ts`), time clock, client portal.

**Design tokens** — HQ uses a light Looplet-ish theme with a navy gradient sidebar; the public site overrides tokens inside `.site-theme` (Archivo/Oswald, charcoal/blue, blueprint grid, rainbow division rule). The two are cleanly separated, so the public redesign cannot break HQ.

## Preserve

- Entire HQ platform layer and interaction quality: shell, sidebar, tabs, RecordLayout, ResourcePage, comms/mail/phone/meetings/drive, RBAC, time clock, notifications, UserMention. Only labels, domain fields, and nav grouping change.
- Route architecture, SEO helpers (`src/lib/seo.ts`, sitemap route), the `hq.clovrlab.com` redirect, and the `.site-theme` scoping pattern.
- Site primitives worth keeping: Section, Reveal, CountUp, CTAButton, Footer/Header skeletons (restyled).

## Remove / rework

- All construction content: `divisions.ts`, `site-content.ts` services & projects, `brand.ts`, all `mg-*` imagery, the "rainbow division rule" and blueprint-grid motifs.
- Public routes `/services`, `/projects`, `/process`, `/divisions*` retired (301-style redirects to their new equivalents).
- Client portal recast as a partner/field portal; quoting/invoicing/job-costing recast as grants, donations, and program budgets.

## Proposed public site (cinematic, scroll-narrative)

New dark-first `.site-theme`: deep atmospheric night/storm base, warm signal-amber for urgency, clean white type, one cool aid-cyan accent. Type pairing: a wide technical display face + neutral grotesk body. No literal Zipline copying — narrative and craft level only.

Home is a single scroll story with sticky, pinned chapters:
1. **Hero** — full-bleed cinematic loop/still, mission line, dual CTA (Donate / Request Help).
2. **The problem** — data-driven counters (disasters, displaced people, response time gap).
3. **Our response** — animated 3D/canvas globe or route-line visualization plotting active response zones.
4. **How it works** — pinned horizontal 4-step chapter (Detect → Deploy → Deliver → Rebuild).
5. **Impact** — large numeric statements + live-ish metrics.
6. **Field stories** — photo-essay cards.
7. **Where we work** — map section.
8. **Give / act** — donation tiers, volunteer, partner CTA.

Routes: `/` , `/mission`, `/response` (capabilities), `/impact`, `/where-we-work`, `/stories` (+ `/stories/$slug`), `/donate`, `/volunteer`, `/partners`, `/about`, `/careers`, `/contact`, `/request-help`, `/faq`, `/legal/*`. Each gets its own `head()` with unique title/description/og and NGO JSON-LD on home and donate.

Motion: scroll-linked reveals and parallax via existing `Reveal` plus IntersectionObserver; one lightweight WebGL/canvas globe loaded client-only after hydration; every effect gated on `prefers-reduced-motion`.

## Proposed HQ structure (relief operations)

- **Core** — unchanged (Dashboard, Communication, Email, Calendar, Drive, Notes, Notifications, Tasks, My Time).
- **Response Ops** — Incidents, Deployments, Field Teams, Situation Reports (was Daily Logs), Scheduling, Assets & Fleet, Safety, After-Action Reviews.
- **Logistics** — Suppliers, Partners, Requisitions (was POs), Inventory & Caches, Shipments, Receiving.
- **Beneficiaries & Cases** — Aid Requests (was tickets), Case Files (was clients), Case Comms, Case Timeline, Knowledge Base.
- **Development & Funding** — Donors, Donations, Grants (was quotes), Campaigns, Pledges, Program Budgets.
- **Finance** — Program Costing, Grant Reporting, Expenses, Accounting, Reports.
- **People** — unchanged, plus Volunteers and Credentials/Certifications.

Database work is renaming/remapping the existing `con_*` domain to a `rel_*` relief domain via migrations; the generic engines (ResourcePage, RecordLayout) need only field-definition changes.

## Sequencing

1. Brand + token layer, new public shell (Header/Footer/BrandLogo), content modules.
2. Home scroll narrative + hero imagery generation.
3. Remaining public routes, SEO, redirects, sitemap.
4. HQ nav + labels + RBAC group rename.
5. Schema migrations and record views per HQ group.

## Open questions

1. Organization name, tagline, and mission sentence — is `clovrlab.com` staying as the domain and brand, or is there a new name?
2. Should donations be real (payment processor) or a visual CTA for now?
3. Should the retired construction HQ data/tables be migrated to the new domain, or wiped and rebuilt clean?
