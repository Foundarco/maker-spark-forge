import { useRef, type ReactNode } from "react";
import { useFilmScroll, type FilmFrame } from "./useFilmScroll";

/**
 * One chapter of the film. A tall track with a pinned stage inside it, wired to
 * the shared scroll engine. Children read progress from the `--ap` custom
 * property or from the act's own frame callback.
 */
export function Act({
  id,
  label,
  vh = 220,
  frame,
  stiffness,
  pinned = true,
  stageClassName = "",
  className = "",
  children,
}: {
  id: string;
  label: string;
  /** track height in vh */
  vh?: number;
  frame?: FilmFrame;
  stiffness?: number;
  pinned?: boolean;
  stageClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  const track = useRef<HTMLElement>(null);
  useFilmScroll(track, frame, stiffness);

  return (
    <section
      ref={track}
      id={id}
      aria-label={label}
      className={`act relative ${className}`}
      style={{ height: pinned ? `${vh}vh` : undefined }}
    >
      {pinned ? (
        <div className={`sticky top-0 h-svh overflow-hidden ${stageClassName}`}>{children}</div>
      ) : (
        <div className={stageClassName}>{children}</div>
      )}
    </section>
  );
}
