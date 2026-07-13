
# Phase 1 — [Brand Name] Marketing Site + Store

Build the full 14-section site in one pass. Brand name and logo stay as swappable placeholders. Store, blog, and contact form are wired to Lovable Cloud so content can be edited without code. No live payments (checkout is a structural placeholder that captures an order record and flags Stripe as a dependency).

## Brand + theming layer (swap-in-one-place)

- `src/config/brand.ts` — single source of truth: `brandName`, `tagline`, `logoUrl`, `socials`, `contactEmails`. Every page reads from this. Replace one file → whole site updates.
- `src/components/BrandLogo.tsx` — renders logo image if set, otherwise a typographic wordmark fallback using `brandName`. Header/footer/OG all use it.
- Design tokens in `src/styles.css`: warm off-white base, deep teal/green primary, rounded-2xl radius scale, "transparency" motif via subtle layered translucency + hairline borders on cards. Refined display + body pairing (not Inter/Poppins). No purple gradients.
- Placeholder text uses a `<Placeholder>` component that renders `[PLACEHOLDER: …]` with a subtle dashed outline in dev, so unfilled copy is obvious at a glance.

## Route map (TanStack Start, file-based)

Each route gets its own `head()` with unique title/description/OG. No hash-anchor sections.

```
/                     Home
/about                About
/mission              Mission & Values
/how-its-built        How It's Built
/learn                Learning Center (index)
/learn/$track         Beginner / Intermediate / Advanced
/community            Community
/help                 Help / Support Center (search + guide list)
/help/$slug           Individual repair guide
/store                Product listing
/store/$slug          Product detail
/cart                 Cart
/checkout             Checkout (structure only; flags payment dep)
/support-us           Backers / Support (flexible placeholder page)
/blog                 Blog index
/blog/$slug           Blog post
/contact              Contact (multi-path form)
/faq                  FAQ
/get-involved        Ambassador / contributor interest form
/legal/privacy
/legal/terms
/legal/shipping-returns
/legal/warranty
/legal/cookies
```

Shared `Header` + `Footer` in `__root.tsx`'s outlet wrapper; both mobile-responsive from the start.

## Reusable components

`Card`, `Section`, `Pillar`, `CTAButton`, `ProductCard`, `PostCard`, `SpecTable`, `FAQItem`, `GuideStep`, `Placeholder`, `BrandLogo`, `NewsletterInline`, `ContactForm`. One Card primitive powers product tiles, blog tiles, and guide tiles.

## Lovable Cloud (backend)

Enable Lovable Cloud. Create these tables with RLS + grants:

- `products` — slug, name, tagline, description, price_cents, images[], specs (jsonb), in_the_box[], related_slugs[], published. Public SELECT where `published = true`.
- `blog_posts` — slug, title, excerpt, body (markdown), category, cover_image, published_at, published. Public SELECT where `published = true`.
- `guides` — slug, title, symptom, category, body, media[], published. Public SELECT where `published`.
- `contact_submissions` — path (support/press/community/partnership/general), name, email, message, created_at. Public INSERT, no SELECT.
- `interest_submissions` — for Get Involved form. Same shape.
- `orders` — cart snapshot + contact info + status='pending_payment'. Public INSERT only. Checkout writes here and shows "we'll email you when payment is live" until Stripe is wired.
- `newsletter_signups` — email, source. Public INSERT.

Seed each content table with 3–6 clearly-marked placeholder rows so the site looks alive on first load.

Reads use TanStack Query loader pattern via `createServerFn` with the server publishable client (public SELECT). Writes (contact, orders, signups) go through server fns doing validated inserts.

## Content approach

Realistic placeholder copy throughout, wrapped in `<Placeholder>` where the user must fill in specifics (founder bio, mission statement, pricing, spec numbers, legal specifics). Language around licensing/structure stays deliberately flexible — no "open source", "nonprofit", "tax-exempt", or firm warranty carve-outs. Warranty page states "1 year, full coverage" as the working default with a `[PLACEHOLDER: confirm final wording]` marker.

## Accessibility + performance

- WCAG AA color contrast on all tokens (verify both light + dark).
- Semantic landmarks, single H1 per page, alt text on every image (empty alt for decorative), 44px min tap targets, visible focus rings, `h-dvh` not `h-screen`.
- Lazy-load below-the-fold imagery, responsive `<img>` with width/height set.

## Explicitly out of scope (flagged in-page)

- Live payments (checkout is structural; Stripe/Paddle to be added later).
- Real forum embed (link-out placeholder; supports Discord/Reddit/in-house swap).
- Real CAD/build-doc links (structure ready, URLs placeholder).
- Real founder bio, mission statement, pricing, specs, legal specifics.

## Build order

1. Brand config + theming + shared layout (Header, Footer, tokens).
2. Enable Lovable Cloud + create tables + seed.
3. Home, About, Mission, How It's Built.
4. Learning Center, Community, Get Involved.
5. Store (list, detail, cart, checkout-structure).
6. Help Center, Blog, FAQ, Contact.
7. Support-us page + all Legal pages.
8. Accessibility + responsive pass across every route.

Everything ships in one build; no per-page pause for review (you asked for the full site now). After it's live you can iterate section-by-section.
