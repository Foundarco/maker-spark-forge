# Public Site — Act-Based Cinematic Mission Film

## A. Current-state findings (verified in code)

Homepage (`src/routes/index.tsx`) renders: `ScrollFx` → `MissionFilm` → `Statement` → `ScrollStory` → `QuoteBanner` → `HowItWorks` → `FlyBanner` → `ImpactCards` → `Newsroom` → CTA section.

Works well:
- `MissionFilm.tsx` engine: one rAF loop, single scroll read per frame, velocity spring, all writes via CSS vars/refs — no React re-render while scrolling. This is the right foundation and should be kept as an engine, not as the whole page.
- `FilmAircraft.tsx`: GLB (Athera VTOL, 319 KB) on a CatmullRomCurve3 with damped position/bank, frameloop gated by an offscreen flag. Sound.
- Reduced-motion / small-screen branch swaps to `JourneyFallback`.

Problems:
- **One format for 15 shots.** All 15 entries in `mission-film.ts` share the same treatment: full-bleed plate + left/right text block + kicker + telemetry chips. Reads as a slideshow. Text is dominant in every single shot.
- **Transitions are cross-fades only.** Plate `win()` opacity ramps + tiny drift/scale. No scene changes (no wipe to map, no lens change, no push-through).
- **Opening is not a film opening.** Shot 01 is a still (`f-california.jpg`) with an H1 and telemetry chips immediately — a technical layout, not a cut-scene reel. The two cinematic MP4s only appear mid-timeline.
- **HUD repetition.** sensor mesh, reticle, confirm badge, water streaks, scan line are all thin cyan/amber line overlays; suppression really is three CSS spans.
- **Below the film, the page reverts to a normal website** — `Statement`, `ScrollStory` (a second pinned scroll narrative), `HowItWorks`, `ImpactCards`, `Newsroom`. `ScrollStory` duplicates the film's story beats.
- **Competing motion systems**: `ScrollFx` rAF loop + `MissionFilm` rAF loop + `SmoothScroll` (Lenis) + Framer Motion whileInView + GSAP installed. Four scroll/animation authorities.
- **Media weight**: `journey-california-flight.mp4` is 46 MB and `preload="metadata"` inside a plate that autoplays on mount; a second 6 MB video also autoplays. Both decode even when invisible.
- **Color monotony**: `film-grade` forces every plate toward night-blue, killing the California blue/green/gold the brief asks for.
- **Copy**: mostly fine and hedged, but telemetry chips like `LINK · CONCEPT`, `ANOMALY · OBSERVED`, `HANDOFF · PREPARING` read as live readouts from a system that does not exist. Autonomy-vs-oversight is only implied in one line.
- **Fallback drift**: `JourneyFallback` still renders the older `config/journey.ts` beats — no suppression/reassessment, different copy.

## B. New homepage information architecture

Twelve Acts, each with its **own** visual format. Acts I–XI are the story; XII is the CTA.

| Act | Beat | Format |
|---|---|---|
| I | Something is happening | Full-bleed cut-scene video reel, minimal text |
| II | See it sooner | Real landscape video + composited 3D UAV |
| III | The ground is listening | Interactive terrain map, sensor nodes |
| IV | Someone is watching | Ops Center: photo + restrained UI layer |
| V | Send the aircraft | Split: autonomy column / human-oversight column |
| VI | Look closer | Payload POV frame (letterboxed camera view) |
| VII | Fire confirmed | RGB→thermal transform of one frame, pinned |
| VIII | Try to slow it | Suppression run — the pinned film engine |
| IX | Check again | Thermal sweep, quiet, short |
| X | Give them the picture | Responder photo essay, warm color, human scale |
| XI | One system | Pull-back architecture reveal (SVG/3D graph) |
| XII | This is only the beginning | Future missions strip + CTA |

`ScrollStory`, `QuoteBanner`, `HowItWorks`, `FlyBanner` are removed (absorbed into Acts). `ImpactCards`/`Newsroom` move below Act XII as ordinary page footer content.

## C. Format detail per Act

- **I — Opening reel.** 5–6 short shots cross-cut on a timed reel (not scroll-scrubbed): fire/smoke, burned structure with a person, UAV in sky, California ridgeline, sensor being installed, ridgeline dawn. Type sequence: "Something starts." → "Every year, it starts somewhere no one is looking." → **"See the fire sooner."** Scroll cue at bottom. No telemetry, no chips, no HUD.
- **II — Landscape + aircraft.** Real ridgeline video plate; the GLB UAV enters and crosses under scroll. One sentence: "It starts small, in country nobody is watching."
- **III — Sensor map.** Dark topo map fills the frame; nodes light up in sequence as you scroll; one node goes amber. Plain copy: "Sensors watch the ground."
- **IV — Ops Center.** Photograph of an operator, with a *restrained* incident panel docked to one side (map, alert row, timeline). Motif line: "The system is autonomous. A person is still watching."
- **V — Autonomy / oversight.** Two-column diagram, no photo. Left AUTONOMOUS: detect → navigate → investigate → reassess. Right HUMAN OVERSIGHT: review → authorize → monitor → coordinate. Readable in seconds.
- **VI — Payload POV.** Letterbox mask, slight lens vignette, timecode corner only. Viewer sees what the aircraft sees.
- **VII — Confirmation.** Same frame; a thermal wipe travels across under scroll until heat dominates. Then, quietly: "Fire confirmed."
- **VIII — Suppression.** The pinned rAF film engine, reused for this Act only: heading change → position → `PAYLOAD · READY` → `AUTHORIZATION · REQUIRED / GRANTED` → controlled pass → release → impact → steam → pull away. Persistent `PLANNED CAPABILITY · IN DEVELOPMENT` label.
- **IX — Reassess.** Short, one sweep, one line.
- **X — Responders.** Warm, human, full-bleed stills; largest amount of white space, least technical.
- **XI — System reveal.** Camera pulls back from responder; nodes connect responder → incident → Ops → UAV → sensors → terrain. Ends on MISSION 01 / WILDFIRE / "This is only the beginning."
- **XII — Future + CTA.** Small strip: search and rescue, disaster mapping, flood, storm, hazardous environments. Then donate / build / partner.

## D. Transition strategy

Each Act boundary is a **scene change**, not a fade. Repertoire, used deliberately and never twice in a row:
1. Push-through (next Act scales up from behind, current pushes out)
2. Wipe-to-map (photo desaturates to topo lines, then rebuilds)
3. Thermal wipe (a hard edge travelling across the frame)
4. Iris/letterbox close-open (entering and leaving payload POV)
5. Match cut (same composition, different medium: fire photo → thermal → map)
6. Pull-back (Act X → XI)
Only Acts I and VIII use continuous timed motion; the others resolve on scroll and settle.

## E. Autonomy + oversight visual language

A reusable two-track lockup component: an amber AUTONOMOUS track and a cyan HUMAN OVERSIGHT track. Full form in Act V; a single compressed chip recurs in Acts IV, VIII (authorization gate) and XI. Copy never says "remote controlled" and never implies unsupervised action.

## F. Realism / media strategy

Priority: real/licensed footage → high-quality generated photorealistic footage → 3D UAV composited into real plates → data overlays → procedural 3D last. No low-poly terrain anywhere. Grade per Act instead of one global night-blue: Acts I–III keep California blue/green/gold, IV–V go cool technical, VI–IX go smoke/amber/thermal, X warm, XI cool.

## G. UAV / 3D strategy

One WebGL canvas for the whole page, mounted at page level, positioned per Act via a shared progress store. Reuse the existing GLB, material and curve; extend the curve with a suppression approach and pass. DPR capped at 1.6, no postprocessing, frameloop `never` when no 3D Act is on screen.

## H. Fire / smoke / suppression strategy

Replace the three CSS streaks with a real payload sequence: a released-mass element with gravity-shaped path, dispersion at release, an impact bloom, and a steam plume that changes the smoke plate. Video/still plates carry the fire; the effect layer carries only the release.

## I. RGB → thermal

Keep the current "same frame, two stacked layers" approach — it is the right idea — but drive it with a hard travelling edge (clip-path) rather than a global opacity blend, so it reads as a sensor switching, not a dissolve.

## J. Operations Center

Photo-first, with a small docked incident panel: map, alert list, aircraft position, route, timeline. No fabricated numbers — states only (OPEN, REVIEWING, AUTHORIZED). This is the recurring "a human is watching" motif.

## K. Scroll / motion architecture

One authority. A single `useFilmScroll` module owns one rAF loop and one scroll read per frame, publishes global progress plus per-Act local progress on refs and CSS custom properties. Acts subscribe; none of them start their own loop.
- Remove Lenis (`SmoothScroll`) and `ScrollFx`'s parallax loop; fold the progress bar into the film engine.
- Remove GSAP (unused after this).
- Keep Framer Motion only for discrete, non-scroll UI (header, buttons, CTA stagger) — never per-frame.
- Pinning via `position: sticky` only.

## L. Performance architecture

- No React state updates per frame anywhere.
- One IntersectionObserver per Act; offscreen Acts get `visibility: hidden`, videos paused, canvas frameloop off.
- At most **one** video decoding at a time; poster-first, `preload="none"`, play on approach, pause and reset on exit.
- Re-encode/replace the 46 MB clip; budget ≤ 6 MB per hero clip, ≤ 1080p, H.264 + optional WebM.
- Transform/opacity only; all reads batched before writes in the loop.
- Lower-power mode: coarse pointer or `deviceMemory < 4` → stills instead of video, no WebGL.

## M. Accessibility / mobile

Reduced-motion and small screens get a single rewritten stacked fallback driven by the *same* Act config (retires the stale `journey.ts` beats). Every Act is a real `<section>` with a heading; one H1 (Act I). Copy reads correctly without motion. Focusable CTAs are never inside pointer-events-none layers.

## N. Assets

Keep: `athera-vtol.glb`, `f-california`, `j-canyon`, `j-fire`, `j-responders`, `j-ops`, `wf-*`, `journey-incident-flight.mp4`.
Replace/re-encode: `journey-california-flight.mp4` (46 MB → compressed).
Generate new: burned-structure human aftermath, sensor install in the field, operator at console, smoke column on horizon, suppression approach, steam-after-impact, responder ground shots, opening reel shots.
Delete: all `mg-*` / `mg2-*` construction-era assets (unused).

## O. File architecture

```text
src/config/acts.ts                    Act definitions: id, copy, format, media, grade
src/components/site/film/useFilmScroll.ts   single rAF/progress authority
src/components/site/film/Act.tsx            sticky Act shell + IO gating
src/components/site/film/UavStage.tsx       single page-level WebGL canvas
src/components/site/film/acts/*.tsx         one component per Act (I–XII)
src/components/site/film/OversightLockup.tsx
src/components/site/film/FilmFallback.tsx   replaces JourneyFallback
```
Removed: `MissionFilm.tsx` (engine extracted), `ScrollStory.tsx`, `QuoteBanner.tsx`, `HowItWorks.tsx`, `FlyBanner.tsx`, `SmoothScroll.tsx`, `ScrollFx.tsx`, `journey/*`, `mission-film.ts`.

## P. Phases

1. Scroll/motion foundation: `useFilmScroll`, `Act` shell, `acts.ts`, remove Lenis/GSAP/`ScrollFx`. Page still renders old content.
2. Act I opening reel + new media (highest visible impact).
3. Acts II–V (landscape+UAV, sensor map, Ops Center, oversight lockup) + single `UavStage`.
4. Acts VI–IX (POV, RGB→thermal, suppression rebuild, reassess).
5. Acts X–XII (responders, system reveal, future+CTA); reattach ImpactCards/Newsroom below.
6. Fallback rewrite, mobile/low-power path, a11y pass.
7. Performance pass: media re-encode, profiling, frame-pacing verification.
8. Copy pass: plain-language first, remove fake telemetry, hedging audit.

## Q. Acceptance criteria

- No two adjacent Acts share a visual format.
- Act I contains no telemetry chips and at most three lines of type.
- A visitor can state "autonomous system, humans in the loop" after Acts IV–V.
- Exactly one rAF loop and one WebGL context on the page.
- Never more than one video decoding at once; no video preloads before approach.
- No React render triggered by scroll.
- Smooth pacing on a mid-range laptop through the full page; no jank at Act boundaries.
- Zero claims of fleet, deployments, detections, response times, lives saved, or successful suppression; suppression labelled planned/in-development wherever shown.
- Reduced-motion path tells the same 12-Act story with current copy.

## R. Risks / tradeoffs

- **Media quality is the ceiling.** Generated footage that looks synthetic will undercut everything; plan for iteration on Act I and VIII shots specifically.
- **Scope.** Twelve bespoke Acts is significantly more work than one parameterized timeline; phased so the page is shippable after each phase.
- **Page weight** grows with more distinct media — mitigated by strict one-video-at-a-time and lazy Act mounting.
- **Removing Lenis** makes scrolling feel less "buttery" on desktop; the film engine's own spring compensates within Acts. If the raw feel is worse we can reintroduce a minimal in-engine smoothing rather than a second library.
- **Suppression realism** is the hardest visual; if the effect looks cheap the honest fallback is a restrained, mostly-implied release.
