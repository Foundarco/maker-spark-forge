import { useEffect } from "react";

/**
 * Page-wide scroll engine. A single rAF loop drives:
 *  - a top reading-progress bar
 *  - every `[data-parallax]` element (value = px of travel across the viewport)
 *  - every `[data-fx-scale]` element (subtle zoom while in view)
 * All work is transform-only, so it stays on the compositor at 60 FPS.
 */
export function ScrollFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    let raf = 0;
    let nodes: HTMLElement[] = [];
    const collect = () => {
      nodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-parallax],[data-fx-scale]"),
      );
    };
    collect();
    const mo = new MutationObserver(() => collect());
    mo.observe(document.body, { childList: true, subtree: true });

    // Heavy parallax is desktop-only; small/touch screens get plain reveals.
    const rich = window.matchMedia("(min-width: 768px) and (pointer: fine)");

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const vh = window.innerHeight;
      const doc = document.documentElement;
      const max = doc.scrollHeight - vh;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;

      if (!rich.matches) return;
      for (const el of nodes) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        // -1 (below the fold) → 1 (above the fold)
        const p = 1 - (r.top + r.height / 2) / (vh / 2 + r.height / 2);
        const travel = Number(el.dataset["parallax"] ?? 0);
        const zoom = Number(el.dataset["fxScale"] ?? 0);
        el.style.transform =
          `translate3d(0, ${(p * travel).toFixed(2)}px, 0)` +
          (zoom ? ` scale(${(1 + zoom * (1 - Math.min(1, Math.abs(p)))).toFixed(4)})` : "");
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      bar.remove();
    };
  }, []);

  return null;
}
