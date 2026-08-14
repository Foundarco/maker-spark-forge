# Clovr Labs Website — Motion & Storytelling Upgrade Plan

**For: Lovable** **Goal:** Keep all existing copy, structure, and content exactly as-is. Upgrade the *feel* of the site — scroll-driven storytelling, continuous motion, and cinematic pacing — closer to sites like [Zipline.com](http://Zipline.com). Real photography/video will be swapped in later; use current images and free stock as placeholders for now, structured so they're easy to replace without touching code.

Send this to Lovable **in phases** (Phase 1 first, check the result, then Phase 2, etc.) rather than all at once — large multi-part prompts are more likely to get partially ignored or break existing sections.

---

## Phase 1 — Motion Foundation (do this first, site-wide)

Add these packages and global behaviors before touching individual sections:

- **Install** `framer-motion` for scroll-triggered reveals and `whileInView` animations.
- **Install** `gsap` **+** `ScrollTrigger` for scroll-scrubbed (pinned) animations — used in Phase 3.
- **Install** `lenis` (or `@studio-freight/lenis`) for smooth/inertia scrolling site-wide. This single change makes the whole site feel more expensive immediately.
- **Nav bar behavior:** on scroll, shrink the nav height slightly and add a subtle backdrop-blur + background opacity increase (it should feel "solid" once you've scrolled past the hero, and float/transparent at the very top).
- **Respect** `prefers-reduced-motion`**:** every animation added in this plan should have a reduced-motion fallback (simple fade, no parallax/scrub) — wrap GSAP/Framer triggers in a media query check.
- **Mobile behavior:** scroll-pin and heavy parallax effects should be simplified or disabled on touch/mobile viewports (below ~768px) — replace with straightforward fade/slide-in-on-view instead, for performance.

---

## Phase 2 — Hero Section ("SEE IT SOONER")

Current: static wildfire photo background, headline, subhead, two buttons.

- Replace the single static background image with a **looping background video or Ken-Burns-style slow zoom/pan** on the current wildfire image (2–3% scale over 15–20s, ease-linear, looping) as a placeholder until real footage is ready. Structure this as a swappable `<video>` or background element clearly commented `<!-- HERO_BG: swap for real flight/build footage -->` so it's a one-line swap later.
- Animate the headline in on load: split "SEE IT" and "SOONER" into separate lines that slide up + fade in with a slight stagger (0.1–0.15s delay between words), not both appearing at once.
- Subhead and buttons fade/slide in after the headline finishes (staggered sequence, not simultaneous).
- Add a subtle scroll-cue indicator at the bottom of the hero (small animated down-arrow or line that pulses) to invite scrolling — Zipline-style sites almost always have this.
- As the user scrolls past the hero, apply a slow parallax so the background image/video moves slower than the foreground text (background scroll speed ~0.5x).

---

## Phase 3 — Story Sections (Sense / Detect / Investigate)

Current: three sections, each with left-side text + stat, right-side image, currently fading in once on scroll.

- Convert each section's image and text block into **scroll-scrubbed reveals** using GSAP ScrollTrigger instead of one-time fades: as the user scrolls through each section, tie image scale/opacity and text position directly to scroll progress (not a trigger-once animation).
- Add a subtle parallax offset between the text column and image column so they move at slightly different speeds as the section scrolls through view (image ~15–20% slower than text).
- Animate the stat numbers (`<60S`, `24/7/365`, `RGB + IR`) as **count-up/reveal-on-view** — e.g., `<60S` counts down from a higher number, `24/7/365` types on digit by digit — rather than appearing statically.
- Add a thin animated progress indicator along the left or right edge of the viewport that fills as the user scrolls through the three-part 01/02/03 sequence, so it reads as one continuous "story" rather than three separate blocks. Label it subtly (e.g., small dots or a vertical line with 01/02/03 markers that highlight as each section becomes active).
- Placeholder media: keep current images (sensor node, wildfire, aircraft-over-mountains) but comment each with `<!-- SECTION_IMG_01/02/03: swap for real hardware/flight photo -->` for easy replacement later.

---

## Phase 4 — Testimonial Section

Current: full-bleed firefighter photo with quote, static.

- Add a slow Ken-Burns zoom (very subtle, 1–2% over the time the section is in view) to the background photo instead of a static hold.
- Animate the quote text in word-by-word or line-by-line as the section enters view, rather than all at once — this is the most emotionally weighted text on the page and deserves the slowest, most deliberate reveal on the site.
- Fade the attribution line ("Wildland fire captain | Northern California") in slightly after the quote finishes.

---

## Phase 5 — "Minutes, Not Mornings" Section

Current: large headline over dark mountain photo, static.

- Same treatment as Hero: slow background parallax/zoom, staggered headline reveal split across its two lines.
- This section currently sits right before the blog/update preview cards — add a clear visual transition (e.g., a slow cross-fade or the background color/imagery gradually shifting) so the move from cinematic section into the more utilitarian "updates" cards doesn't feel abrupt.

---

## Phase 6 — CTA ("Build Mission 01 With Us") + Footer

- Animate the three CTA buttons (Support the mission / Build with us / Partner with us) in with a staggered rise, triggered on scroll into view.
- Add a subtle hover state to all buttons site-wide if not already present: slight scale (1.02–1.03x) + background shift on hover, with a quick, snappy easing (not linear).
- Footer can stay mostly static — this is expected/normal for footers — but apply the same fade-in-on-view treatment used elsewhere for consistency rather than leaving it instant.