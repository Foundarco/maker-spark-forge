import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered reveal. Adds `.is-in` once the element enters the viewport.
 * Falls back to visible when IntersectionObserver is unavailable (SSR/hydration safe).
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.classList.add("is-in");

    // Already in (or above) the viewport on mount — reveal right away.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      show();
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show();
            io.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    io.observe(el);

    // Safety net: never leave content invisible.
    const t = window.setTimeout(show, 2500);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);


  const T = Tag as React.ComponentType<{
    ref?: unknown;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }>;

  return (
    <T
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </T>
  );
}
