# Continuous Cinematic Mission Journey

## Goal

Rebuild the public homepage as one scroll-controlled aerospace film. The UAV remains the visual protagonist from California landscape through detection, dispatch, investigation, thermal intelligence, and responder handoff. The reference informs motion quality and continuity only; its screenshots, branding, layouts, and subject matter will not be recreated.

## Current implementation to replace

- `MissionJourney` already uses one normalized progress value and direct DOM writes, but each of the 12 beats is still an independent full-screen photograph whose opacity rises and falls. That architecture produces a polished slideshow, not persistent object or camera continuity.
- The aircraft exists only inside individual background images, so it cannot physically travel between scenes.
- Text blocks also reset per beat instead of transforming with the environment.
- Three.js runtime packages and the prior scene were removed; only Three.js types remain.
- The reduced-motion fallback is a separate stacked photographic sequence and should remain available as the accessible alternative.

## Experience structure

Build one pinned, full-viewport journey with overlapping chapters rather than discrete sections:

```text
California dawn
  → UAV enters and camera locks on
  → terrain reveals sensor coverage
  → anomaly blooms into alert telemetry
  → terrain/data morph into Operations Center
  → route assignment wraps around the aircraft
  → UAV accelerates back into real landscape
  → smoke/fire appears ahead
  → RGB targeting view
  → same view transforms continuously into thermal
  → coordinates, perimeter, and mapping assemble
  → responder handoff
  → camera pulls back to reveal the complete system
```

The UAV will persist through the entire sequence. Where a literal aircraft would not belong—such as inside the Operations Center—it transitions into a live 3D mission model/route marker, then expands back into the physical aircraft for dispatch.

## Build plan

### 1. Replace the plate system with a hybrid cinematic stage

- Reintroduce Three.js/React Three Fiber behind a client-only boundary.
- Use one transparent, full-viewport WebGL canvas for a detailed fixed-wing UAV, camera, atmospheric particles, smoke/fire accents, sensor pulses, route lines, and the thermal/data treatment.
- Place realistic California photo/video plates behind the canvas. They will overlap and transform continuously—parallax, depth drift, masked reveals, color evolution, and camera-matched transitions—rather than appearing as one image per scroll stop.
- Source or build a license-safe detailed UAV model with PBR materials, realistic proportions, working propeller, control-surface detail, navigation lights, and believable banking/pitch response.

### 2. Create a single coordinated timeline

- Define one 0–1 master timeline containing camera keyframes, UAV spline positions, environment transitions, typography states, sensor/alert events, Operations Center UI, RGB-to-thermal shader progression, and mapping overlays.
- Read scroll once per animation frame, smooth it with frame-rate-independent damping, and feed refs/uniforms directly; do not update React state during scroll.
- Use overlapping scene ranges so each scene emerges from the previous one. Avoid hard opacity cuts, fixed beat snapping, and independent section observers inside the journey.
- Give the aircraft continuous velocity, banking, subtle turbulence, propeller motion, and camera lag so the user feels carried through space instead of moving a cursor along a page.

### 3. Build realistic environments and transitions

- Generate/select a small cohesive set of cinematic California landscape and wildfire video plates: Sierra/coastal foothill terrain, pine/oak vegetation, dry grass, atmospheric haze, smoke, and changing blue/green/amber light.
- Use depth-separated foreground/midground/background layers where possible so scrolling produces believable camera travel.
- Transition into the Operations Center through telemetry: sensor lines converge, the landscape darkens into a map surface, incident data assembles, and the UAV persists as the mission object.
- Return to physical flight by turning the route visualization into a horizon line and letting the aircraft fly through it.
- Make RGB → thermal one continuous visual transformation of the same incident view using shader/color-map interpolation, heat bloom, reticle changes, and telemetry—not a swapped image.

### 4. Integrate typography and technical graphics

- Replace repeated lower-left copy cards with cinematic type choreography: labels track with objects, headings scale/mask through transitions, and short technical readouts lock to the aircraft, sensor nodes, incident, and map.
- Keep copy concise and preserve the existing wildfire mission narrative.
- Use amber for detection/fire, cyan for telemetry/intelligence, California sky blues and vegetation greens for environment, and warm responder tones at handoff.
- Keep the existing public brand typography and aerospace HUD language, while removing visual treatments that read as generic webpage sections.

### 5. Performance and accessibility

- Lazy-load the 3D engine after the opening visual is ready; keep a real eager LCP image/poster for fast first paint and SEO.
- Preload only the next required media segment, compress video for web delivery, cap DPR, reuse geometry/materials, avoid expensive post-processing, and lower particle/detail budgets on smaller devices.
- Pause rendering/media when the journey is offscreen or the tab is hidden.
- Preserve `prefers-reduced-motion` with a refined static narrative; provide a lower-cost mobile mode that retains the aircraft-led continuity without desktop-level effects.
- Remove the global smooth-scroll interaction from this journey if it conflicts with the damped timeline.

### 6. Homepage integration and verification

- Make the header visually recede over the opening flight and restore normal navigation behavior after the cinematic stage.
- Transition the final system pullback naturally into the existing Operations Center and technology content below; no abrupt black gap or duplicated story beat.
- Verify desktop and mobile framing, full journey continuity, reduced motion, LCP, media loading, canvas recovery, text legibility, and no overlap.
- Profile the live preview while scrolling and tune for stable frame pacing; validate that no React render loop is driven by scroll and that the UAV remains visible/intentional through every chapter.

## Primary implementation areas

- `src/components/site/journey/MissionJourney.tsx` — master scroll/timeline shell
- New client-only journey scene modules — UAV, camera rig, environment, smoke/fire, sensor/map/HUD layers
- `src/config/journey.ts` — continuous ranges and keyframes instead of independent photo beats
- `src/components/site/journey/JourneyFallback.tsx` — reduced-motion/mobile-safe alternative
- `src/styles.css` — cinematic stage, masks, media layers, and semantic visual tokens
- `src/routes/index.tsx` and public header — stage integration and final transition
- Journey media/model assets and runtime dependencies

## Acceptance criteria

- The homepage reads as one continuous mission film, not a sequence of full-screen slides.
- The same UAV visibly travels or transforms through every major story stage.
- Camera, aircraft, type, maps, environment, and color are controlled by the same smooth timeline.
- California terrain, wildfire, smoke, and aircraft materials feel realistic rather than procedural/low-poly.
- RGB becomes thermal continuously on the same incident view.
- Scroll produces no React state churn and maintains stable, smooth frame pacing on supported desktop hardware.
- Reduced-motion and lower-powered devices receive a coherent, accessible experience rather than a broken or blank canvas.