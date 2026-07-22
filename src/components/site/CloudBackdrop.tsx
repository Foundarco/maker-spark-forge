// Decorative animated cloud backdrop — pure CSS, no runtime deps.
export function CloudBackdrop({ variant = "sky" }: { variant?: "sky" | "soft" | "dawn" }) {
  const bg =
    variant === "dawn"
      ? "linear-gradient(180deg, #fef3e2 0%, #dbeafe 55%, #e0f2fe 100%)"
      : variant === "soft"
        ? "linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)"
        : "linear-gradient(180deg, #dbeafe 0%, #eff6ff 50%, #ffffff 100%)";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: bg }} />
      <svg
        className="absolute inset-0 h-full w-full opacity-90"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="cloudA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="220" cy="150" rx="260" ry="80" fill="url(#cloudA)" />
        <ellipse cx="900" cy="90" rx="360" ry="70" fill="url(#cloudA)" />
        <ellipse cx="1280" cy="240" rx="280" ry="90" fill="url(#cloudA)" />
        <ellipse cx="480" cy="360" rx="380" ry="100" fill="url(#cloudA)" />
        <ellipse cx="1100" cy="480" rx="420" ry="110" fill="url(#cloudA)" />
        <ellipse cx="80" cy="520" rx="300" ry="90" fill="url(#cloudA)" />
      </svg>
    </div>
  );
}
