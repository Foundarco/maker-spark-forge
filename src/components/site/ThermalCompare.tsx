import { useRef, useState } from "react";
import aerial from "@/assets/wf-aerial.jpg";

/**
 * RGB vs thermal comparison. The thermal view is a stylised concept
 * visualisation, not captured sensor output.
 */
export function ThermalCompare() {
  const [pos, setPos] = useState(52);
  const wrap = useRef<HTMLDivElement | null>(null);

  const move = (clientX: number) => {
    const el = wrap.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(98, Math.max(2, p)));
  };

  return (
    <figure className="m-0">
      <div
        ref={wrap}
        className="relative aspect-[16/10] w-full select-none overflow-hidden border border-border bg-[var(--night)]"
        onPointerMove={(e) => e.buttons === 1 && move(e.clientX)}
        onPointerDown={(e) => move(e.clientX)}
      >
        <img
          src={aerial}
          alt="Aerial optical view of a forested ridge with early smoke"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          width={1600}
          height={1104}
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <img
            src={aerial}
            alt="Concept thermal visualisation of the same ridge"
            className="thermal-view absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            width={1600}
            height={1104}
          />
          <div className="scanlines absolute inset-0" aria-hidden />
        </div>

        {/* handle */}
        <div className="absolute inset-y-0 w-px bg-[var(--signal)]" style={{ left: `${pos}%` }} aria-hidden />
        <input
          type="range"
          min={2}
          max={98}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare optical and thermal views"
          className="absolute inset-x-0 bottom-4 mx-auto w-[70%] accent-[var(--signal)]"
        />

        {/* labels + HUD */}
        <span className="absolute left-4 top-4 border border-border bg-background/70 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-foreground/80">
          RGB / optical
        </span>
        <span className="absolute right-4 top-4 border border-[color:var(--signal)]/50 bg-background/70 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--signal)]">
          Thermal · concept
        </span>
        <span className="absolute bottom-16 left-4 font-mono text-[0.62rem] tracking-[0.16em] text-foreground/70">
          38.9021 N · 120.5412 W · AGL 412 m · HDG 214°
        </span>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Concept visualisation. Thermal rendering is illustrative of intended capability, not captured sensor output.
      </figcaption>
    </figure>
  );
}
