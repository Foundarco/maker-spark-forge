import { brand } from "@/config/brand";

export function BrandLogo({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const textColor = tone === "dark" ? "text-[oklch(0.18_0.02_250)]" : "text-ink";
  const subColor = tone === "dark" ? "text-[oklch(0.45_0.02_250)]" : "text-muted-foreground";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span aria-hidden className="relative grid h-9 w-9 place-items-center">
        <svg viewBox="0 0 36 36" className="h-9 w-9">
          {/* scan ring + detection mark */}
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
          <circle cx="18" cy="18" r="9.5" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2.4 2.4" />
          <path d="M18 10.5l6.6 11.4H11.4z" fill="none" stroke="var(--signal)" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="18" cy="18.6" r="1.7" fill="var(--signal)" />
          <path d="M18 1.5v4M18 30.5v4M1.5 18h4M30.5 18h4" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-display text-[0.98rem] font-bold uppercase tracking-[0.16em] ${textColor}`}>
          {brand.name}
        </span>
        <span className={`mt-1.5 block text-[0.56rem] font-medium uppercase tracking-[0.22em] ${subColor}`}>
          Disaster detection + UAV response
        </span>
      </span>
    </span>
  );
}
