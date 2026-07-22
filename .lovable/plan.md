# Website rebuild — "Nimbus Forge"

Pivoting the public site from Loomprint (3D printer product) to a full-service hardware product-development studio, wrapped in a literal cloud brand.

## Brand direction

- **Name:** Nimbus Forge — clouds (Nimbus) + hardware/making (Forge). Tagline: *"From idea to shelf. One team, one cloud."*
- **Palette (cloud-native, added to `src/styles.css`):**
  - `--sky-50` #F4F8FC (page bg), `--sky-100` #E6EFF8, `--sky-200` #CDDDEC
  - `--cloud` #FFFFFF, `--cloud-shadow` #DCE4EE
  - `--ink` #0F1B2D (deep storm-navy for text), `--ink-soft` #4A5A70
  - `--primary` #3A7BD5 (clear-sky blue), `--primary-glow` #6FA8E8
  - `--accent` #F5C56A (sunlight through clouds — warm CTA accent)
- **Typography:** Instrument Serif (display, italic touches for "cloud" words) + Inter (body).
- **Visual system:** photoreal sky/cloud hero + section backdrops, plus soft SVG cloud silhouettes as decorative accents, drifting subtly on scroll. Rounded 2xl cards with soft cloud-shadow blur. No hard black.

## Scope (full rebuild)

Rebrand `src/config/brand.ts` (Nimbus Forge, new mission/pillars/contact placeholders) so all headers/footers/meta update.

### New / rewritten routes
- `/` Home — cloud hero, problem→solution, service pillars, process, portfolio teaser, CTA
- `/services` — overview of the four service groups (Product Dev, Branding & Launch, Manufacturing, Operations)
- `/services/product-development`, `/services/branding-launch`, `/services/manufacturing`, `/services/operations` — leaf pages, each with capability list + example deliverables
- `/process` — Discovery → Design → Prototype → Manufacture → Launch → Operate (6-step cloud-journey visual)
- `/work` — portfolio grid (placeholder case studies)
- `/work/$slug` — case study template
- `/about` — mission, vision, team placeholders, "documenting in public" ethos
- `/journal` — replaces `/blog`, same data source
- `/journal/$slug`
- `/contact` — simple contact info + link to quote
- `/quote` — **primary CTA**: structured multi-step intake (project type, stage, services needed, timeline, budget range, description, contact). Submits to a new `quote_requests` table via a server function; emails notification via existing Resend setup.
- `/legal/privacy`, `/legal/terms` — keep, restyle

### Removed / redirected (Loomprint-specific)
Delete: `store`, `store.$slug`, `cart`, `checkout`, `compare`, `accessories`, `parts`, `upgrades`, `materials*`, `software*`, `learn*`, `how-its-built`, `mission` (folded into `/about`), `community`, `get-involved`, `support-us`, `press`, `careers` (keep as light placeholder), `faq`, `help*`, `legal.warranty`, `legal.shipping-returns`, `legal.cookies`.

Corresponding `products`/content queries in `src/lib/content.functions.ts` swapped from printers/materials to services + case studies.

### Shared components
- `Header` / `Footer` updated for new nav (Services, Process, Work, Journal, About, Contact → Request a Quote button).
- New `CloudBackdrop` component: layered SVG clouds + subtle parallax drift.
- New `ServiceCard`, `ProcessStep`, `CaseStudyCard`.
- `BrandLogo` gets a small cloud mark (inline SVG) next to the wordmark until a real logo exists.

### Imagery
Generate 6–8 hero/section images via `imagegen` (photoreal skies, cloud landscapes, subtle hardware silhouettes against clouds), uploaded through `lovable-assets`. Replace existing `hero-printer` / `materials` / `community` / `detail` asset pointers.

### Data / backend
- New `quote_requests` table (id, name, email, company, project_type, stage, services text[], timeline, budget, description, status, created_at) with RLS: anon INSERT allowed, authenticated employees SELECT/UPDATE via `is_employee`. GRANTs included.
- Server function `submitQuoteRequest` (public, rate-limit friendly, Zod-validated) — inserts row and sends notification email through existing Resend infra.
- HQ side: add a lightweight `/quote-requests` view under Growth Team to triage submissions (reuses `ResourcePage`).

## SEO / metadata

Each route gets its own `head()` with unique title, meta description, og:title, og:description. Home + leaf pages set `og:image` to their absolute hero URL. `robots`/canonical tags on all public routes.

## Out of scope this pass

- Final logo artwork (typographic mark + cloud SVG placeholder for now)
- Real case study content (structured placeholders)
- Pricing pages (quote-driven for now)
- HQ-side changes beyond the new quote-requests triage view

## Technical notes

```text
src/
  config/brand.ts                (rewrite)
  components/site/
    CloudBackdrop.tsx            (new)
    ServiceCard.tsx              (new)
    ProcessStep.tsx              (new)
    CaseStudyCard.tsx            (new)
    Header.tsx / Footer.tsx      (nav rewrite)
    BrandLogo.tsx                (cloud mark)
  routes/
    index.tsx                    (rewrite)
    services.tsx + 4 children    (new)
    process.tsx                  (new)
    work.tsx, work.$slug.tsx     (new)
    about.tsx                    (rewrite)
    journal.tsx, journal.$slug   (rename from blog.*)
    contact.tsx                  (rewrite)
    quote.tsx                    (new, primary CTA)
    _hq.quote-requests.tsx       (new, triage)
    [Loomprint routes]           (delete)
  lib/
    content.functions.ts         (services + case studies)
    quote.functions.ts           (new server fn)
  styles.css                     (cloud tokens)
```

Migration adds `quote_requests` with GRANTs + RLS in one file. Existing Loomprint tables in the DB are left in place (unused) to avoid touching HQ data.
