import { useEffect, type RefObject } from "react";
import { uav } from "./uav";

/** page progress where the dawn begins and where it is complete */
const LIGHT_FROM = 0.14;
const LIGHT_TO = 0.56;

/**
 * The single motion authority for the public film.
 *
 * One rAF loop, one scroll read per frame, one IntersectionObserver.
 * Acts register an element and receive a smoothed 0 → 1 local progress plus
 * frame timing. Nothing here ever triggers a React render.
 */

export type FilmFrame = (
  p: number,
  ctx: { t: number; dt: number; velocity: number },
) => void;

type Entry = {
  el: HTMLElement;
  frame?: FilmFrame;
  /** spring stiffness — higher settles faster */
  stiffness: number;
  visible: boolean;
  height: number;
  top: number;
  p: number;
  v: number;
  target: number;
};

const entries = new Set<Entry>();
let raf = 0;
let observer: IntersectionObserver | null = null;
let last = 0;
let reduced = false;

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  const vh = window.innerHeight;

  // ── pass 1: reads ────────────────────────────────────────────────
  for (const e of entries) {
    if (!e.visible) continue;
    const rect = e.el.getBoundingClientRect();
    e.top = rect.top;
    e.height = rect.height;
  }
  const doc = document.documentElement;
  const pageMax = doc.scrollHeight - vh;
  const page = pageMax > 0 ? clamp(window.scrollY / pageMax) : 0;

  // ── pass 2: writes ───────────────────────────────────────────────
  doc.style.setProperty("--page-p", page.toFixed(4));

  // dark → dawn: one light value the whole site reads
  const lightRaw = clamp((page - LIGHT_FROM) / (LIGHT_TO - LIGHT_FROM));
  const light = lightRaw * lightRaw * (3 - 2 * lightRaw);
  doc.style.setProperty("--light", light.toFixed(4));
  uav.light = light;

  for (const e of entries) {
    if (!e.visible) continue;
    const span = e.height - vh;
    e.target =
      span > 60
        ? clamp(-e.top / span)
        : clamp((vh - e.top) / (vh + e.height));

    if (reduced) {
      e.p = e.target;
      e.v = 0;
    } else {
      const delta = e.target - e.p;
      const k = e.stiffness + Math.min(90, Math.abs(delta) * 340);
      e.v += delta * k * dt;
      e.v *= Math.exp(-10 * dt);
      e.p += e.v * dt;
      if (Math.abs(delta) < 0.00005 && Math.abs(e.v) < 0.0005) {
        e.p = e.target;
        e.v = 0;
      }
      e.p = clamp(e.p);
    }

    e.el.style.setProperty("--ap", e.p.toFixed(4));
    e.frame?.(e.p, { t, dt, velocity: e.v });
  }
}

function ensureRunning() {
  if (raf) return;
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        for (const e of entries) {
          if (e.el === record.target) e.visible = record.isIntersecting;
        }
      }
    },
    { rootMargin: "25% 0px" },
  );
  for (const e of entries) observer.observe(e.el);
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

function stopIfIdle() {
  if (entries.size) return;
  cancelAnimationFrame(raf);
  raf = 0;
  observer?.disconnect();
  observer = null;
}

/** Register an Act section with the shared loop. */
export function useFilmScroll(
  ref: RefObject<HTMLElement | null>,
  frame?: FilmFrame,
  stiffness = 44,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const entry: Entry = {
      el,
      ...(frame ? { frame } : {}),
      stiffness,
      visible: true,
      height: el.offsetHeight,
      top: 0,
      p: 0,
      v: 0,
      target: 0,
    };
    entries.add(entry);
    ensureRunning();
    observer?.observe(el);
    return () => {
      observer?.unobserve(el);
      entries.delete(entry);
      stopIfIdle();
    };
    // frame closures are stable per act (refs only)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export { clamp };

/** eased 0→1 ramp */
export const ramp = (v: number, a: number, b: number) =>
  clamp((v - a) / Math.max(0.0001, b - a));

/** smoothstep */
export const ease = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};

/** in/out window: 0 → 1 → 0 across four stops */
export const win = (p: number, a: number, b: number, c: number, d: number) =>
  ease(ramp(p, a, b)) * (1 - ease(ramp(p, c, d)));
