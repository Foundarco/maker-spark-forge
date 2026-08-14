# Homepage / Cinematic Journey Audit (read-only)

## 1. What the homepage actually renders today

`src/routes/index.tsx` renders, in order:

1. `ScrollFx` — global rAF engine (progress bar, `[data-parallax]`, `[data-fx-scale]`)
2. `FilmHero` — 100svh cut-scene reel, 5 plates (4 videos + 1 image), 1.4s cross-dissolves, Ken-Burns transform per cut, grade + vignette + film grain, `h1` "See it sooner"
3. `Statement` — cream panel, oversized masked type, floating 3D UAV (`UavCanvas mode="float"`)
4. `ScrollStory` — 500vh track, sticky stage, 4 pinned chapters (Sense / Detect / Investigate / Inform) with photo plates
5. `QuoteBanner` — 86vh parallax responder plate + pull quote
6. `HowItWorks` — cream section, centered `UavCanvas mode="scroll"` with 6 numbered steps left/right
7. `FlyBanner` — dark canyon parallax beat
8. `ImpactCards` — 3 dark cards ("24/7/365", "Mission 01", "0 deployments")
9. `Newsroom` — cream 4-card grid
10. Closing CTA section (donate / join / partners)

`Header` is a floating pill that condenses past 0.72 viewport; `Footer` is the cinematic sitemap plate.

## 2. Implemented vs. planned-but-not-wired

Not wired in (dead code — zero imports outside their own folder):

- `src/components/site/journey/MissionJourney.tsx` (236 lines) — the full 1320vh pinned master-timeline stage
- `src/components/site/journey/MissionAircraftScene.tsx` — R3F aircraft scene, lazy-loaded only by MissionJourney
- `src/components/site/journey/JourneyFallback.tsx` — reduced-motion variant
- `src/config/journey.ts` — the 12-beat chapter model (california → … → system)
- `.journey-*` CSS block in `src/styles.css` (~100 lines: stage, thermal pass, grid, network nodes, alert ring, reticle, keyframes)
- `journey-california-flight.mp4` (46 MB) and `journey-incident-flight.mp4` (6 MB) are referenced by MissionJourney and also re-used by FilmHero

So the ambitious 12-beat cinematic journey from the archived plan exists in code but the live homepage is the simpler Zipline-style section stack. The only 3D actually on screen is the Athera VTOL GLB in `Statement` and `HowItWorks`.

## 3. Current visual / story architecture

- Alternating dark (`--night`) and cream `oklch(0.97 0.012 95)` bands; amber `--signal`, cyan `--aid` accents; condensed display type + mono kickers.
- Story: hero hook → thesis statement → 4-chapter scroll-locked explainer → human quote → airframe walkthrough → emotional beat → status cards → newsroom → CTA.
- Motion: three independent rAF loops (`ScrollFx`, `FilmHero`, `ScrollStory`) plus one per `UavCanvas` instance, an IntersectionObserver per `Reveal`, and a `MutationObserver` on `document.body` in ScrollFx.

## 4. Issues worth naming

Performance
- Hero preloads four MP4s in the DOM at once; `hero-ridgeline-dawn.mp4` is 37 MB and `journey-california-flight.mp4` is 46 MB. All five plates are mounted and animating even when opacity is 0 — heavy decode cost and a poor LCP/data profile on mobile.
- `ScrollFx` keeps a `MutationObserver` on the whole body subtree and re-queries the DOM on every mutation.
- Every rAF loop runs unconditionally at 60 Hz, including when the tab/section is offscreen (`FilmHero` and `UavCanvas` scroll loops never bail out).
- Two `UavCanvas` instances each create their own WebGL context, their own `Environment` HDRI, and remount on visibility toggles.

Correctness / quality
- `FilmHero` drives cut changes through React state on a timer, so the whole hero subtree re-renders every 4–8s.
- No `prefers-reduced-motion` guard in `FilmHero` or `ScrollStory` (only `ScrollFx` and CSS reveals honor it).
- `ScrollStory` returns early when offscreen without resetting, and its 500vh track makes the mid-page feel long on small screens.
- The dead `journey` module still pulls two large video assets into the bundle graph via `FilmHero`, so removing it alone won't drop the weight.
- Hero `h1` is the only H1 — good; but the mission narrative is now split between `ScrollStory` and `HowItWorks`, which repeat the same four ideas in different words.

## 5. Keep / rewrite / remove

Keep
- Section stack and rhythm in `index.tsx`; `Reveal`/`Words`; `Header` pill; `Footer`; `Statement`, `QuoteBanner`, `ImpactCards`, `Newsroom` as-is.
- The Athera GLB pipeline and `UavCanvas` component shape.

Rewrite
- `FilmHero` media strategy: one compressed hero video (≤ 6 MB, 1080p, ~10s loop) plus lazily-attached later cuts; move cut switching off React state onto refs/CSS.
- `ScrollStory` and `HowItWorks`: merge into one authoritative "how it works" narrative to stop the duplication.
- Consolidate the rAF loops into a single shared ticker with visibility gating.

Remove (or consciously revive)
- `journey/` folder, `src/config/journey.ts`, and the `.journey-*` CSS block if the 12-beat film is not the direction; keep them only if step 6 below is chosen.
- The 46 MB `journey-california-flight.mp4` from the hero reel regardless.

## 6. Recommended next sequence

1. Decide the direction: (A) polish the current Zipline-style section stack, or (B) revive `MissionJourney` as the homepage and demote the sections below it.
2. Fix media weight first — re-encode/replace hero videos, single eager plate, lazy the rest. This is the biggest perceived-quality and performance win either way.
3. Unify the scroll engine into one ticker with offscreen + reduced-motion gating.
4. Deduplicate the narrative (ScrollStory vs HowItWorks) and tighten copy.
5. Upgrade the 3D: shared canvas, real materials/lighting instead of one flat `MeshStandardMaterial` override, propeller/banking motion.
6. Only then, if direction (B): wire `MissionJourney` in, port its thermal/reticle/network layers onto the shared ticker, and delete the superseded sections.

Confirm A or B and I'll plan the implementation against it.
