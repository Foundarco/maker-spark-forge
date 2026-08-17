# Nonprofit Disaster Relief

AI Agent Build Prompts — [Brand Name]

Two phases, kept in one doc. Use Phase 1 now. Save Phase 2 for later once the org and product are further along.

Note: Business structure (for-profit / nonprofit) and hardware licensing (open source / proprietary / hybrid) are both still undecided. This prompt is written to be structure-agnostic — it builds the site with placeholders and flexible sections so nothing has to be re-architected once those decisions are made.

PHASE 1: Marketing Site + Store

Prompt to give the AI agent

You are building the full website for [Brand Name], a company building
community-first 3D printers with a mission to make 3D printing approachable
and to expand youth STEM education.

BRAND FEEL
Warm and legible — not industrial, not cheap/plasticky. Rounded corners
throughout. Visible mechanism / transparency as a design motif (echoing the
brand's "you can see how it works" philosophy). Primary accent color: deep
green or teal (nature-inspired, tied to founder's interests) against a
neutral gray/off-white base. Clean, confident typography — avoid anything
that reads "corporate SaaS template" or "hobbyist forum."

TONE OF VOICE
Knowledgeable friend, not a manual or a corporation. Honest about tradeoffs.
Encouraging without being cutesy. Educational by default — every page should
teach something, not just sell something.

TECH STACK (adjust if you have a stronger recommendation)
Next.js + Tailwind CSS. Fully responsive, mobile-first. Accessible (WCAG AA
minimum — this matters given the youth/education audience). Fast page loads;
avoid heavy unoptimized assets.

SITE MAP — build in this order, one page/section at a time, reviewing with
me before moving to the next:

1. HOME / LANDING PAGE
   - Hero: what we are and why (one clear sentence — mission-forward, not
     "buy our printer")
   - Core value props as 3-4 short pillars, not a wall of text
     (e.g. community-first, built to teach, designed to last — final
     wording TBD, use placeholders)
   - Product teaser section (printer + pellets), linking to Store
   - "Why we're different" comparison (vs. closed/locked-down ecosystems —
     fair, not trashing competitors by name)
   - Community proof section (forum activity, ambassador highlights —
     placeholder content until real)
   - Mission callout with a clear path to the About page
   - Footer with full site navigation, legal links, social/Discord

2. ABOUT US
   - Origin story (founder's background, why this exists — personal,
     honest, not corporate-speak)
   - Mission statement (use the version I provide separately)
   - Brand pillars (5 pillars — I'll provide the list)
   - Team / community section (placeholder structure for now — keep
     flexible for staff, contractors, or volunteers depending on final
     structure)

3. MISSION & VALUES
   - Deeper dive into the 5 brand pillars
   - Youth STEM education focus explained concretely (what programs exist
     or are planned)
   - Philosophy on repairability, transparency, and community (keep this
     section's language flexible — final hardware licensing model is
     still undecided, so avoid firm claims like "fully open source" and
     use placeholder copy I can refine later)

4. HOW IT'S BUILT
   - Full construction breakdown: frame, motion system, electronics,
     printed parts
   - Links to CAD files / build documentation (placeholder links — build
     the structure to support public access later if that's the direction
     we go)
   - Upgrade parts you can print yourself
   - Repair philosophy: "if it breaks, you can fix it, and we'll show you
     how" (iFixit-style guide structure)

5. LEARNING CENTER
   - Course structure: Beginner / Intermediate / Advanced tracks
   - "Missions" concept — short guided first-print projects
   - Ambassador-led classes (placeholder listing structure)

6. COMMUNITY
   - Forum embed or link-out (Discord, Reddit, in-house forum — build
     structure to support whichever we choose later)
   - Model-sharing library preview
   - Ambassador program explainer + how to apply

7. HELP / SUPPORT CENTER
   - Searchable repair guide structure (symptom → diagnosis → step-by-step
     fix, photos/video placeholders)
   - Contact support form
   - Warranty policy summary with link to full legal page

8. STORE
   - Product listing page (printer, pellets/filament, accessories,
     replacement parts)
   - Product detail page template — needs: images, spec table, price,
     "what's in the box," related upgrade parts, reviews section
   - Cart + checkout flow (structure only for now if payment processing
     isn't set up yet — flag this as a dependency, don't fake a live
     payment system)

9. SUPPORT / BACKERS (optional page — structure only)
   - Flexible page for either crowdfunding updates, community backing, or
     donations, depending on final business structure — build the
     layout but keep copy as placeholder until the model is decided

10. BLOG / NEWS
    - Simple post listing + individual post template
    - Categories: Build Updates, Community, Education, Company News

11. LEGAL PAGES (build as clean, real content, not lorem ipsum — flag
    anywhere you need me to provide real specifics)
    - Privacy Policy
    - Terms of Service
    - Shipping & Returns Policy
    - Warranty Policy (1 year standard, full coverage, no per-part
      carve-outs — I'll confirm final wording)
    - Cookie Policy (if using any tracking/analytics)
    - Note: do not add any nonprofit, tax-exempt, or fiscal sponsorship
      language anywhere on the site — that decision hasn't been made yet

12. CONTACT US
    - General contact form
    - Separate paths for: support, press/media, community involvement,
      partnership inquiries

13. FAQ
    - Structure for common questions — printer, ordering, warranty,
      product/material questions

14. GET INVOLVED
    - Explains how people can get involved (contributor, ambassador, or
      volunteer path — keep flexible pending final structure)
    - Application/interest form
    - Ties to Learning Center (ambassador path)

BUILD INSTRUCTIONS
- Work through the site map in order. After each page, stop and show me
  the result before continuing to the next.
- Use realistic placeholder content where real copy isn't provided yet,
  clearly marked as placeholder (e.g., [PLACEHOLDER: replace with real
  founder bio]).
- Do not fabricate specific claims (pricing, specs, legal terms, business
  structure, tax status, licensing model, warranty details) — use clearly
  marked placeholders instead and flag what you need from me.
- Keep components modular and reusable (e.g., one Card component for
  both product listings and blog posts if the pattern fits) so the site
  is easy to extend later.
- Every page should be mobile-responsive from the start, not
  retrofitted later.


Before you run this — fill in for the agent

[ ] Final brand name (replace all [Brand Name] instances)

[ ] Final mission statement (pick/refine from the options in the brand doc)

[ ] Logo / color hex codes if decided

[ ] Real founder bio for About page

[ ] Decide on final business structure (for-profit / nonprofit) and hardware licensing model (open source / proprietary / hybrid) before publishing any related legal or mission language — keep everything as clearly marked placeholders until those are locked in

PHASE 2: Internal ERP System

Don't start this until Phase 1 is live and you have real operational data (even a handful of real orders/team members) to design against. Building an ERP against imaginary data leads to a system that doesn't fit reality.

Prompt to give the AI agent (for later)

You are building an internal operations system ("ERP-lite") for [Brand
Name], a company building 3D printers. This is an internal tool, not
customer-facing — prioritize functionality and clarity over polish.

CORE MODULES (build and validate one at a time, in this order)

1. INVENTORY
   - Track raw materials (extrusion, electronics, hardware) and finished
     goods (printers, accessories, pellets/filament)
   - Low-stock alerts
   - Supplier/vendor records tied to each inventory item

2. ORDERS
   - Customer order tracking from purchase through fulfillment
   - Status pipeline (received → processing → shipped → delivered)
   - Link orders to inventory deductions automatically

3. MANUFACTURING / BUILD TRACKING
   - Track printer builds through assembly stages
   - QC checklist per unit before it ships
   - Serial number / unit tracking tied back to the customer order

4. SUPPORT TICKETS
   - Customer support request intake and tracking
   - Link tickets to warranty status and order history
   - Repair guide reference linking (pull from Help Center content)

5. WARRANTY CLAIMS
   - Track claims against warranty terms (1 year standard)
   - Link to original order/serial number
   - Resolution tracking (replace part, full replacement, repair)

6. FUNDING / BACKER TRACKING (keep flexible — could end up tracking
   investors, crowdfunding backers, grants, or donations depending on
   final business structure; build the data model generically around
   "funding source" rather than assuming one type)
   - Track funds received by source
   - Track any reporting deadlines or obligations tied to specific
     funding (e.g. grant deliverables, investor updates)
   - Simple contact/communication log per funding source

7. TEAM / CONTRIBUTOR MANAGEMENT
   - Roster, roles, hours or work contributed (works whether these are
     employees, contractors, or volunteers)
   - Ambassador program tracking (who's teaching what classes, where)

BUILD INSTRUCTIONS
- Start with Inventory and Orders — everything else depends on those
  being solid first.
- Use a real database (not spreadsheets-disguised-as-a-database) since
  this needs to scale with the org.
- Every module should be usable by a non-technical team member, not just
  a developer — favor clear forms and dashboards over anything requiring
  direct database access.
- Flag anywhere financial/tax-sensitive logic is being built — this
  should be reviewed by whoever handles the org's actual bookkeeping/
  accounting before being relied on for real financial records.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://maker-spark-forge.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bb3b707d-fecc-4a18-be12-c9ddea559f35).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
