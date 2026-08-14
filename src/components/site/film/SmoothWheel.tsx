import { useEffect } from "react";

/**
 * Inertial wheel scrolling for the film.
 *
 * The page glides between acts instead of jumping: wheel input feeds a target
 * position and one rAF loop eases the window toward it. Touch, keyboard and
 * anchor scrolling are left completely alone.
 */
export function SmoothWheel({ ease = 0.085 }: { ease?: number }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const maxY = () => document.documentElement.scrollHeight - window.innerHeight;
    let target = window.scrollY;
    let current = target;
    let raf = 0;
    let driving = false;

    const step = () => {
      const delta = target - current;
      if (Math.abs(delta) < 0.4) {
        current = target;
        window.scrollTo(0, current);
        driving = false;
        raf = 0;
        return;
      }
      current += delta * ease;
      window.scrollTo(0, current);
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      driving = true;
      if (!raf) raf = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return;
      const line = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      e.preventDefault();
      if (!driving) current = window.scrollY;
      target = Math.max(0, Math.min(maxY(), target + e.deltaY * line));
      start();
    };

    const onScroll = () => {
      if (!driving) {
        target = window.scrollY;
        current = target;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ease]);

  return null;
}
