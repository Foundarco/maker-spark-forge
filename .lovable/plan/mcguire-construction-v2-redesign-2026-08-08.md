# McGuire Construction — V2 Redesign

Keep the professional foundation, add real visual weight: cinematic photography, editorial typography, numbered sections, dark/light rhythm, and a new multi-division structure. Internal HQ stays untouched.

## Brand

- BUILT SINCE 1995. BUILT FOR WHAT'S NEXT. / "Building the next generation of McGuire Construction."
- History: Michael McGuire founded the business in Illinois in 1995; the next generation carries it forward in California.
- Palette stays restrained: near black, charcoal, warm white, concrete gray, natural wood tone, one quiet accent. No orange/black clichés.
- Typography becomes a design element: condensed architectural display for headings, large scale, uppercase `01 / LEGACY` section labels, occasional oversized background numerals.

## Homepage (rebuilt)

1. **Hero** — full-bleed cinematic construction photo, dark overlay: MCGUIRE CONSTRUCTION / BUILT SINCE 1995. BUILT FOR WHAT'S NEXT. / family-legacy line. Buttons: START A PROJECT, EXPLORE MCGUIRE. Bottom meta strip: EST. 1995 · CALIFORNIA · FAMILY BUILT.
2. **01 / LEGACY** — split screen, large photo left, SINCE 1995 story right, plus a 4-stop timeline (1995 → DECADES → TODAY → NEXT).
3. **02 / DIVISIONS — THE MCGUIRE GROUP** — "ONE COMPANY. MULTIPLE CAPABILITIES." Five large horizontal numbered panels (01–05), each with image, division name, discipline line, status chip, and Learn More link.
4. **03 / PROCESS — BUILT ON SYSTEMS.** PLAN → PREPARE → BUILD → DELIVER as a connected numbered diagram (horizontal desktop, vertical mobile), each with its three sub-items.
5. **04 / PROJECTS — THE WORK SPEAKS FOR ITSELF.** Large asymmetric image grid with category labels (Residential, Remodeling, Carpentry, Outdoor, Repairs, Construction) and VIEW ALL PROJECTS.
6. **05 / WHY MCGUIRE** — four oversized typographic statements (EXPERIENCE, HANDS-ON, SYSTEMS, LONG TERM) over subtle imagery, not cards.
7. **06 / THE FUTURE** — dark full-width section: THIS IS ONLY THE BEGINNING, with the CONSTRUCTION → CONCRETE → EXCAVATION → LANDSCAPE → DEVELOPMENT progression.
8. **CTA** — HAVE SOMETHING TO BUILD? with START A PROJECT and VIEW OUR WORK.

## Divisions

New `/divisions` index plus a reusable template at `/divisions/$slug` for the five divisions with hero, MISSION, CAPABILITIES, STATUS, VISION. Statuses shown honestly as CURRENT (Construction), COMING SOON (Concrete), FUTURE (Excavation, Landscape), LONG-TERM (Development). Every non-current division carries the line: "This division is part of McGuire Construction's long-term vision and is not currently accepting projects." No fake service offerings or fake pricing.

## Other pages

- **About** — reworked around the Illinois-1995 → California-today story and the expanded timeline.
- **Services** — stays, retitled under the Construction division, linked from the divisions system.
- **Projects / Process / Contact** — kept, restyled to the new visual system (larger imagery, numbered labels, section rules).
- **Header** — nav becomes Services, Projects, Divisions, About, Process, Contact + START A PROJECT.
- **Footer** — large: brand block with EST. 1995 and the brand statement, full nav column, divisions column, California line, legal links.

## Imagery

Generate a set of new cinematic construction photos (framing, concrete pour, excavation/earthmoving, hardscape, heavy equipment, site aerial, close-up craftsmanship) as CDN assets, reusing the existing mg-* photos where they still fit. All placeholders labeled as reference imagery, never presented as completed McGuire projects. Descriptive alt text, lazy loading below the fold.

## Interactions

Restrained only: image hover zoom, division panel hover reveal, small scroll fade/offset, smooth in-page scroll. Everything respects `prefers-reduced-motion`.

## Technical notes

- New `src/config/divisions.ts` typed data module (slug, name, discipline, status, mission, capabilities, vision, image) driving homepage panels, `/divisions`, and `/divisions/$slug`.
- Extend `src/config/site-content.ts` with the timeline, process phases, and why-McGuire statements.
- Refresh `.site-theme` tokens in `src/styles.css` (concrete gray, wood/earth tone, dark section surface) and add the condensed display face via a `<link>` in `__root.tsx`.
- New site components: `SectionLabel`, `DivisionPanel`, `TimelineRail`, `ProcessDiagram`, `StatementBlock`, `MediaSplit`. Header/Footer rewritten.
- SEO: per-route title/description/og/canonical, `og:image` on hero pages, GeneralContractor JSON-LD on home and contact, BreadcrumbList on division pages, sitemap updated for `/divisions` routes.

## Assumptions

- Phone number in `brand.ts` is still the `(555)` placeholder — I'll keep contact-form-first and leave it clearly marked until you give a real number.
- Service area shown as California; no city list until you confirm one.
- No real McGuire project photos yet, so the projects grid uses labeled reference imagery.
