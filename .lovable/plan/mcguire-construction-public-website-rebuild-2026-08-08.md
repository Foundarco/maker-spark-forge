# McGuire Construction — Public Website Rebuild

Replace the Nimbus Forge cloud-themed marketing site with a restrained, architectural site for McGuire Construction. The internal HQ workspace stays untouched.

## Brand foundation

- Name: McGuire Construction. Established 1995 (family legacy wording only — never "operating in California since 1995").
- Primary message: BUILT SINCE 1995. BUILT FOR WHAT'S NEXT.
- Supporting: A family construction legacy carried into the next generation.
- Palette: black, off-white, charcoal, warm neutral, single restrained accent line color. No orange/black clichés, no gradients, no big rounded cards, minimal shadows.
- Type: strong condensed/geometric display for headings, clean sans for body. Uppercase headings with tight tracking, wide whitespace, thin 1px rules as the main structural device.
- Motion: fades and small offsets only, respects reduced motion.

## Pages

1. **Home** — full-bleed hero image + headline, buttons Start a Project / View Projects; short intro ("Construction Built on Experience."); services preview grid (6 categories linking to Services); three principles (Build Well / Communicate Clearly / Build for the Long Term); final CTA.
2. **Services** — structured list (rule-separated rows, not cards) of the six services with the availability/licensing note.
3. **Projects** — portfolio grid with image, name, category, short description. Content comes from a small typed data file so real photos can drop in later. Placeholders are explicitly labeled "Placeholder — for replacement", never presented as completed McGuire work.
4. **About** — hero "A FAMILY LEGACY. A NEW GENERATION.", 1995 / Today / The Mission blocks, concise.
5. **Process** — 01–07 steps, horizontal numbered timeline on desktop, vertical on mobile.
6. **Contact / Start a Project** — intake form: name, email, phone, project address, project type (dropdown), description, desired timeline, approximate budget, photo upload, additional info. Confirmation copy: "Project request received. We'll review the information provided and follow up regarding next steps." No response-time promise.

Navigation: Home, Services, Projects, About, Process, Contact + "Start a Project" CTA. Clean full-screen mobile menu. Footer: company block, nav, service areas placeholder, legal line.

## Technical notes

- New `src/config/brand.ts` (McGuire identity, services, process steps, principles) as the single content source.
- Replace cloud tokens in `src/styles.css` with the construction palette and new font links in `__root.tsx` (link tags, not CSS @import).
- Rebuild `src/components/site/*`: Header, Footer, Section/PageHeader, and add `SectionRule`, `ServiceRow`, `ProjectCard`, `TimelineStep`. Remove `CloudBackdrop`.
- Routes: rewrite `/`, `/services`, `/about`, `/process`; add `/projects` and `/contact`; delete the leftover unlinked Loomprint/Nimbus routes (store, materials, software, learn, community, faq, work, etc.).
- Intake form reuses the existing `quote_requests` server function pattern. The current table's `stage`/`service` enums don't match construction — a migration will widen the intake fields (project_type, address, timeline, budget, photo URLs) before wiring the form. Photo uploads go to a storage bucket with anonymous insert-only access.
- Architecture kept extension-ready: content in typed data modules, DB-backed intake, so projects/CRM/estimates/scheduling can be layered on later without a rewrite.
- Images: high-quality architectural/construction photography generated as placeholders, CDN-hosted, all with descriptive alt text, lazy-loaded below the fold.

## SEO

Per-route title, meta description, og:title/og:description/og:url, canonical, og:image on pages with a hero. LocalBusiness/GeneralContractor JSON-LD on Home and Contact, BreadcrumbList on deep pages. Updated `robots.txt` and `sitemap.xml` for the new route set. Single H1 per page, semantic sections.

## Assumptions to confirm

- Public phone/email and California service area aren't finalized — I'll use a contact form-first approach and leave clearly marked placeholders for phone, email, and service area.
- The HQ internal workspace and its routes stay exactly as they are.
