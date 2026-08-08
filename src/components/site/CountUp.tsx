import { useEffect, useRef, useState } from "react";

/** Animates a numeric value (supports prefixes/suffixes like "420+" or "100%"). */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  const ref = useRef<HTMLSpanElement | null>(null);
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const [n, setN] = useState(match ? 0 : NaN);

  useEffect(() => {
    if (!match) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setN(target);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const dur = 1100;
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(target * eased);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, match]);

  if (!match) return <span className={className}>{value}</span>;

  const decimals = (match[2].split(".")[1] ?? "").length;
  const shown = n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {match[1]}
      {shown}
      {match[3]}
    </span>
  );
}
