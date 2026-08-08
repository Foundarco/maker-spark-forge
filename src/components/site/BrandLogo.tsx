import { brand } from "@/config/brand";

export function BrandLogo({
  className = "",
  tone = "auto",
}: {
  className?: string;
  tone?: "auto" | "light" | "dark";
}) {
  const textColor = tone === "light" ? "text-white" : tone === "dark" ? "text-ink" : "text-ink";
  const markStyle =
    tone === "light"
      ? "border-white/40 text-white"
      : "border-ink/25 text-ink";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        aria-hidden
        className={`grid h-9 w-9 place-items-center border ${markStyle} font-display text-sm font-bold tracking-tight`}
      >
        MC
      </span>
      <span className="leading-none">
        <span className={`block font-display text-[0.95rem] font-bold uppercase tracking-[0.12em] ${textColor}`}>
          McGuire
        </span>
        <span
          className={`mt-1 block text-[0.6rem] font-medium uppercase tracking-[0.22em] ${
            tone === "light" ? "text-white/60" : "text-muted-foreground"
          }`}
        >
          Construction · Est. {brand.established}
        </span>
      </span>
    </span>
  );
}
