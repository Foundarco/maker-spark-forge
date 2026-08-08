import { useEffect, useRef, useState } from "react";

/** Animates a numeric value (supports prefixes/suffixes like "420+" or "100%"). */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  const ref = useRef<HTMLSpanElement | null>(null);
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let done = false;

    const run = () => {
      if (done) return;
      done = true;
      const dur = 1000;
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setN(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
        else setN(target);
      };
      raf = requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver === "undefined") {
      setN(target);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    // Safety net so a number never stays stuck part-way.
    const fallback = window.setTimeout(() => {
      io.disconnect();
      setN(target);
    }, 3000);

    return () => {
      window.clearTimeout(fallback);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [target]);

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

