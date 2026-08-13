import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered reveal. Adds `.is-in` once the element enters the viewport.
 * Falls back to visible when IntersectionObserver is unavailable (SSR/hydration safe).
 */
export type RevealVariant = "up" | "left" | "right" | "scale" | "blur" | "mask" | "rise-rotate";

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  variant,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  variant?: RevealVariant;
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
      className={`reveal ${variant ? `fx-${variant}` : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </T>
  );
}

/** Splits a headline into words that stagger in once the parent Reveal fires. */
export function Words({ text, step = 70 }: { text: string; step?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} className="fx-word" style={{ "--w-delay": `${i * step}ms` } as React.CSSProperties}>
          {w}
          {i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}
