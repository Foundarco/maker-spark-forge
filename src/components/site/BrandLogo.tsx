import { brand } from "@/config/brand";

export function BrandLogo({ className = "", tone = "auto" }: { className?: string; tone?: "auto" | "light" | "dark" }) {
  if (brand.logoUrl) {
    return <img src={brand.logoUrl} alt={brand.name} className={className} />;
  }
  const textColor = tone === "light" ? "text-white" : tone === "dark" ? "text-ink" : "";
  return (
    <span className={`inline-flex items-center gap-2 font-display text-[1.05rem] font-bold tracking-tight ${textColor} ${className}`}>
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-black text-sm"
      >
        {brand.name.trim().charAt(0) || "•"}
      </span>
      <span>{brand.name}</span>
    </span>
  );
}
