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
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
          <circle cx="18" cy="18" r="9.5" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
          <circle cx="18" cy="18" r="3.2" fill="var(--signal)" />
          <path d="M18 2v6M18 28v6M2 18h6M28 18h6" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-display text-[0.98rem] font-bold uppercase tracking-[0.16em] ${textColor}`}>
          {brand.shortName} Relief
        </span>
        <span className={`mt-1.5 block text-[0.58rem] font-medium uppercase tracking-[0.24em] ${subColor}`}>
          Disaster response · Est. {brand.established}
        </span>
      </span>
    </span>
  );
}
