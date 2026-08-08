# McGuire HQ — Rebuild the internal workspace for construction

Keep the current look, the tab bar, calls, messaging, email, calendar, drive and the assistant exactly as they are. Everything else gets re-cut around how a construction company actually runs: jobs, crews, subs, materials, safety, draws.

## New navigation

```text
Core            Dashboard · Assistant · Email · Communication · Calendar · Drive · Notes
Preconstruction Leads & Bids · Estimates · Takeoffs & RFQs · Proposals & Contracts ·
                Plans & Drawings · Submittals & RFIs · Permits & Approvals
Field Ops       Jobs · Schedule · Daily Logs · Crews & Dispatch · Time & Attendance ·
                Equipment & Fleet · Safety & Incidents · Inspections & QC · Punch List
Materials       Suppliers & Subcontractors · Purchase Orders · Materials Inventory ·
                Deliveries & Receiving
Clients         Client Directory · Service Requests · Warranty Claims · Conversations ·
                Client Timeline · Knowledge Base
Finance         Job Costing · Invoices & Draws · Change Orders · Accounting & Expenses ·
                Reports · Pipeline
Operations      People · Hiring · Certifications & Training · Performance · Org Chart ·
                Dashboards · Company Settings
```

Removed as not applicable: firmware/repos, software & APIs, infrastructure & monitoring, product catalog/features, factory live, assembly, packaging & shipping tracking, digital twin, R&D lab pages, brand/launches, investors. Their routes redirect to the closest new page so old tabs never dead-end.

## Record pages in the style of the reference

Jobs and Clients get the three-pane record layout from the screenshots, reusing the existing `RecordLayout`:

- Left: photo/site card, contact details, quick actions (Estimate, Change Order, Schedule, Invoice), job summary stats (contract value, billed, outstanding, % complete, days on site).
- Center: the live conversation thread with the client or crew, with send-via tabs (Message, Email, Call, Internal Note), same composer we already have.
- Right: activity rail — journey stage (Lead → Estimate → Contract → In Progress → Punch List → Closeout), recent activity, and a link to the full timeline.

Same pattern, construction fields instead of fencing CRM fields.

## Dashboard

Role-aware as it is today, but the widgets become: active jobs by stage, crews on site today, today's schedule, open RFIs/submittals, safety incidents this month, materials arriving, unbilled work, missed messages/mentions.

## Data

Reuse the existing tables wherever the shape already fits (projects, tasks, milestones, inventory, purchase orders, suppliers, inspections, invoices, expenses, contracts, deals, tickets, warranty, HR, KB). One migration adds the genuinely new construction domains, each with grants, RLS via `is_employee()`, and seeded demo rows:

- `con_daily_logs` (job, date, weather, crew count, hours, work performed, delays, photos)
- `con_equipment` (asset, type, status, assigned job, hours/mileage, next service)
- `con_safety_incidents` (job, type, severity, injured party, OSHA reportable, corrective action)
- `con_permits` (job, authority, permit type, number, status, inspection dates)
- `con_submittals` (job, spec section, type RFI/submittal, ball-in-court, due, status)
- `con_change_orders` (job, number, scope, cost delta, days delta, approval status)
- `con_subcontractors` (trade, insurance expiry, W-9, rating, active jobs)
- `con_crews` + `con_crew_assignments` (crew, foreman, members, job, dates)
- `con_estimates` + `con_estimate_lines` (job/lead, line items, cost, markup, total)

Job costing and draw schedules are computed views over estimates, purchase orders, time entries and invoices — no duplicate storage.

## Automation that ties it together

- Approved estimate creates the job, its schedule milestones and the client record.
- Daily log submission rolls crew hours into time & attendance.
- Change order approval updates contract value, job cost budget and the next draw.
- Permit and certification expiry dates raise dashboard alerts and notifications.
- Equipment service thresholds create maintenance tasks.

## Technical notes

- `nav-config.ts` regrouped; new routes are `_hq.<name>.tsx` built on the existing `ResourcePage` config pattern, so search, KPIs, CRUD and tab-opening keep working unchanged.
- Removed routes stay as thin redirect files to keep `route-access.ts` and any saved tabs valid; `route-access.ts` role mapping is updated to the new group names.
- `RecordLayout` gains a compact stat-grid slot for the left card; no visual token changes.
- Theme, colors, topbar, phone/WebRTC, sounds and mention system are untouched.

## Build order

1. Migration + grants/RLS + seed data.
2. Nav regroup, redirects, route-access update.
3. Preconstruction and Field Ops pages.
4. Materials, Clients, Finance pages.
5. Job and Client record pages in the reference layout.
6. Dashboard widgets and the automation triggers.
