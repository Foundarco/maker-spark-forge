import { useEffect, useRef, useState } from "react";

type Node = { x: number; y: number; r: number };

const NODES: Node[] = [
  { x: 12, y: 68, r: 0 }, { x: 24, y: 52, r: 1 }, { x: 33, y: 74, r: 2 },
  { x: 44, y: 44, r: 3 }, { x: 52, y: 66, r: 4 }, { x: 61, y: 34, r: 5 },
  { x: 66, y: 58, r: 6 }, { x: 76, y: 46, r: 7 }, { x: 84, y: 70, r: 8 },
  { x: 90, y: 36, r: 9 }, { x: 38, y: 26, r: 10 }, { x: 20, y: 34, r: 11 },
];

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6], [5, 6],
  [5, 7], [6, 8], [7, 8], [7, 9], [3, 10], [10, 11], [11, 1], [10, 5],
];

/**
 * Distributed sensor-node network map. One node raises a detection on a
 * rotating cycle and the signal propagates toward the Operations Center node.
 */
export function SensorNetwork({ className = "" }: { className?: string }) {
  const [alert, setAlert] = useState(2);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    timer.current = window.setInterval(() => {
      setAlert(Math.floor(Math.random() * NODES.length));
    }, 3600);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  return (
    <svg
      viewBox="0 0 100 90"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Concept map of distributed wildfire sensor nodes linked across terrain, reporting to an operations center"
    >
      {/* terrain contours */}
      <g stroke="currentColor" strokeOpacity="0.13" fill="none" strokeWidth="0.3">
        <path d="M0 74 C 18 62, 30 80, 46 68 S 74 54, 100 66" />
        <path d="M0 62 C 20 48, 34 66, 50 54 S 78 40, 100 52" />
        <path d="M0 50 C 22 36, 36 52, 54 40 S 80 28, 100 38" />
        <path d="M0 38 C 24 26, 40 40, 58 28 S 82 18, 100 26" />
      </g>

      {/* links */}
      {LINKS.map(([a, b]) => {
        const A = NODES[a]!;
        const B = NODES[b]!;
        const hot = a === alert || b === alert;
        return (
          <line
            key={`${a}-${b}`}
            x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke={hot ? "#f59e0b" : "currentColor"}
            strokeOpacity={hot ? 0.75 : 0.22}
            strokeWidth={hot ? 0.4 : 0.22}
            style={{ transition: "stroke 600ms ease, stroke-opacity 600ms ease" }}
          />
        );
      })}

      {/* nodes */}
      {NODES.map((n, i) => {
        const hot = i === alert;
        return (
          <g key={i}>
            {hot ? (
              <circle cx={n.x} cy={n.y} r="3.4" fill="#f59e0b" fillOpacity="0.16" className="live-pulse" />
            ) : null}
            <circle
              cx={n.x} cy={n.y} r={hot ? 1.5 : 1}
              fill={hot ? "#f59e0b" : "#38bdf8"}
              fillOpacity={hot ? 1 : 0.75}
              style={{ transition: "all 500ms ease" }}
            />
            <rect
              x={n.x - 2.4} y={n.y - 2.4} width="4.8" height="4.8"
              fill="none" stroke={hot ? "#f59e0b" : "currentColor"}
              strokeOpacity={hot ? 0.6 : 0.2} strokeWidth="0.18"
            />
          </g>
        );
      })}

      {/* operations center */}
      <g>
        <circle cx="50" cy="12" r="5" fill="none" stroke="#f59e0b" strokeOpacity="0.35" strokeWidth="0.25" />
        <circle cx="50" cy="12" r="2.4" fill="#f59e0b" fillOpacity="0.85" />
        <line
          x1={NODES[alert]!.x} y1={NODES[alert]!.y} x2="50" y2="12"
          stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="0.25" strokeDasharray="1.4 1.4"
        />
        <text x="50" y="5.5" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="2.6" letterSpacing="0.35">
          OPERATIONS CENTER
        </text>
      </g>
    </svg>
  );
}
