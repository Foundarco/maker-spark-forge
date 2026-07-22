import { brand } from "@/config/brand";
import { Cloud } from "lucide-react";

export function BrandLogo({ className = "", tone = "auto" }: { className?: string; tone?: "auto" | "light" | "dark" }) {
  if (brand.logoUrl) {
    return <img src={brand.logoUrl} alt={brand.name} className={className} />;
  }
  const textColor = tone === "light" ? "text-white" : tone === "dark" ? "text-ink" : "";
  const iconBg = tone === "light" ? "bg-white/10 text-white" : "bg-sky text-primary";
  return (
    <span className={`inline-flex items-center gap-2 font-display text-[1.1rem] font-semibold tracking-tight ${textColor} ${className}`}>
      <span
        aria-hidden
        className={`grid h-8 w-8 place-items-center rounded-xl ${iconBg}`}
      >
        <Cloud className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span>{brand.name}</span>
    </span>
  );
}
