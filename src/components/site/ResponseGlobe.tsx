import { useEffect, useRef } from "react";

type Point = { lat: number; lon: number; label: string; hot?: boolean };

const POINTS: Point[] = [
  { lat: 29.7, lon: -95.4, label: "Gulf Coast", hot: true },
  { lat: 13.1, lon: -59.6, label: "Eastern Caribbean" },
  { lat: 45.5, lon: -122.7, label: "Pacific Northwest" },
  { lat: 37.8, lon: -82.5, label: "Central Appalachia", hot: true },
  { lat: -17.7, lon: 178.0, label: "South Pacific" },
  { lat: 44.9, lon: -97.1, label: "Northern Plains" },
  { lat: 14.6, lon: 121.0, label: "Luzon" },
  { lat: 19.4, lon: -99.1, label: "Central Mexico" },
];

/**
 * Lightweight canvas globe: rotating wireframe sphere with pulsing response
 * markers and arcing dispatch lines. No WebGL, no dependencies.
 * Pauses entirely when the user prefers reduced motion.
 */
export function ResponseGlobe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let width = 0;
    let height = 0;
    let radius = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width, height) * 0.38;
    };

    resize();
    window.addEventListener("resize", resize);

    const project = (lat: number, lon: number, spin: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + spin) * (Math.PI / 180);
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      return { x, y, z };
    };

    const draw = (t: number) => {
      const spin = reduce ? 20 : (t / 90) % 360;
      const cx = width / 2;
      const cy = height / 2;
      ctx.clearRect(0, 0, width, height);

      // Atmosphere
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.45);
      glow.addColorStop(0, "rgba(56,189,248,0.14)");
      glow.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Latitude rings
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 4) {
          const p = project(lat, lon, spin);
          const sx = cx + p.x;
          const sy = cy - p.y;
          if (lon === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = `rgba(148,197,232,${p_alpha(lat)})`;
        ctx.stroke();
      }

      // Longitude arcs (front hemisphere only, faded by depth)
      for (let lon = 0; lon < 360; lon += 20) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 4) {
          const p = project(lat, lon, spin);
          if (p.z < 0) {
            started = false;
            continue;
          }
          const sx = cx + p.x;
          const sy = cy - p.y;
          if (!started) {
            ctx.moveTo(sx, sy);
            started = true;
          } else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = "rgba(148,197,232,0.10)";
        ctx.stroke();
      }

      // Outline
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(148,197,232,0.22)";
      ctx.stroke();

      // Markers
      POINTS.forEach((pt, i) => {
        const p = project(pt.lat, pt.lon, spin);
        if (p.z < 0) return;
        const sx = cx + p.x;
        const sy = cy - p.y;
        const depth = 0.35 + (p.z / radius) * 0.65;
        const pulse = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(t / 420 + i);
        const color = pt.hot ? "245,158,11" : "34,211,238";

        ctx.beginPath();
        ctx.arc(sx, sy, 2.6 * depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${depth})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, (5 + pulse * 9) * depth, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color},${(1 - pulse) * 0.5 * depth})`;
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Rotating globe showing regions where Clovr Relief pre-positions supplies and runs active responses"
      className={className}
    />
  );
}

function p_alpha(lat: number) {
  return lat === 0 ? 0.2 : 0.09;
}
