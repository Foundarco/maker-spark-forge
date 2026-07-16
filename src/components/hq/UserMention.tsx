import { useState, useRef, useEffect } from "react";
import { ProfilePopover } from "./ProfilePopover";

/**
 * Clickable user mention chip. Renders as an inline pill with the user's
 * name (and optional avatar dot); clicking opens the ProfilePopover with
 * quick actions (message, email, view details).
 *
 * Use this anywhere a user's name would appear in text/UI — attendee lists,
 * hosts, authors, assignees, mentions, etc.
 */
export function UserMention({
  userId,
  name,
  tone,
  showAt = false,
  size = "sm",
  className = "",
}: {
  userId: string;
  name: string;
  /** Optional pre-styled tone (background + color). If omitted, uses neutral. */
  tone?: string;
  /** Prefix the label with @. */
  showAt?: boolean;
  size?: "xs" | "sm";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const popoverWidth = 288; // w-72
    const x = Math.min(r.left, window.innerWidth - popoverWidth - 8);
    const y = Math.min(r.bottom + 4, window.innerHeight - 260);
    setAnchor({ x: Math.max(8, x), y: Math.max(8, y) });
  }, [open]);

  const initial = name.charAt(0).toUpperCase();
  const sizeCls = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  const toneCls = tone ?? "border-border bg-muted/50 text-foreground hover:bg-muted";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`inline-flex items-center gap-1 rounded-full border transition ${sizeCls} ${toneCls} ${className}`}
        title={`View ${name}`}
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-background text-[9px] font-semibold">{initial}</span>
        <span className="max-w-[10rem] truncate">{showAt ? `@${name}` : name}</span>
      </button>
      {open && (
        <ProfilePopover
          userId={userId}
          onClose={() => setOpen(false)}
          anchor={anchor ?? undefined}
        />
      )}
    </>
  );
}
