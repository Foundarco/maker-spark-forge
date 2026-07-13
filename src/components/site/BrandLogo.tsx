import { brand } from "@/config/brand";

export function BrandLogo({ className = "" }: { className?: string }) {
  if (brand.logoUrl) {
    return <img src={brand.logoUrl} alt={brand.name} className={className} />;
  }
  return (
    <span
      className={`font-display text-xl font-semibold tracking-tight ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden
          className="inline-block h-3 w-3 rounded-sm border border-primary bg-primary/20"
        />
        {brand.name}
      </span>
    </span>
  );
}
