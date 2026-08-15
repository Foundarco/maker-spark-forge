# Dark-to-Dawn: one continuous light arc for the public film

The whole homepage becomes a single emotional gradient. It opens in the dark with fire and loss, rain arrives and turns into the detection network, clouds break, and the page brightens into a warm dawn light mode where the aircraft is revealed. The scroll position itself drives the light.

## The arc

```text
 0%            25%            45%            65%              100%
 |  FIRE       |  RAIN        |  CLOUD BREAK |  WARM DAWN      |
 near-black    wet slate      pale grey-gold cream / sand / gold
 amber embers  rain -> pings  silhouettes    ink-on-cream text
```

Every act reads its brightness from one global scroll value, so nothing "switches themes" — it fades continuously as you scroll. Nav, footer, cards, HUD chrome, and the 3D scene all inherit it.

## Act-by-act changes

1. **Opening (dark)** — burnt-neighborhood reel and the text build stay as they are. Ends on hard black.
2. **Rain (new act)** — a newly generated cinematic clip of rain falling on smoldering ruins, graded cold and wet. Over it, an animated rain layer: real streaks that, as you keep scrolling, slow down, freeze, and become sensor pings on a terrain map. Rain literally becomes the detection network. Copy shifts from grief to "something is watching now."
3. **Detection / sensing acts** — reworked to live inside that rain-to-data language: falling data streaks, ping rings, coordinate readouts. Background lifts from black to wet slate.
4. **Cloud break (new act)** — a volumetric cloud layer scrolls past the camera; light level climbs sharply here. Text is minimal, one line, big.
5. **Aircraft reveal (rebuilt)** — the 3D UAV pushes up through the cloud deck as a dark silhouette against brightening sky, then light fills in the model. It settles center-frame in warm dawn light and slowly rotates while hardware callouts animate in.
6. **Remaining acts, impact, newsroom, footer** — carried into full warm-dawn light mode: cream and sand surfaces, soft gold light, dark ink type, amber kept as the signal accent for continuity.

## Warm dawn palette (light half)

- Background: cream / warm sand, subtle gold gradient wash
- Text: deep ink brown-black
- Accent: existing amber signal (unchanged, now on light)
- Secondary: soft dawn rose in gradients only

## Technical approach

- Add a global `--light` value (0 -> 1) written once per frame by the existing `useFilmScroll` loop alongside `--page-p`. No new scroll listeners, no extra rAF loops.
- Introduce dual token sets in `src/styles.css`: dark tokens and dawn tokens, with the live surface/ink/border tokens interpolated between them via `color-mix` driven by `--light`. Acts keep using the same semantic tokens, so no per-component color rewrites.
- `Header.tsx` and `Footer.tsx` read the same variable, so the condensed nav pill and footer flip to light glass automatically as you pass the cloud break.
- New acts `ActRain` and `ActClouds` added to `src/config/acts.ts` and `MissionStory.tsx`; the existing sensing/ops acts are re-graded rather than rebuilt.
- Rain streaks and cloud layers are CSS/canvas 2D (cheap), not extra WebGL contexts. The single existing `UavStage` WebGL context stays the only one.
- `UavStage` gains dawn lighting and a cloud-emergence beat: its light rig, environment tint, and aircraft weight curve are keyed off the same `--light`/act progress values.
- Generate one new rain-on-ruins video clip for the rain act; reuse existing clips elsewhere.
- Reduced-motion and mobile fallback keep the same color arc, driven by act index instead of continuous scroll.

## Out of scope

- No changes to HQ, portal, or any internal route.
- No claims of proven suppression, deployed fleet, or operational performance.
