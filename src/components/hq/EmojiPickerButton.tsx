import { Smile } from "lucide-react";
import { useEffect, useRef, useState, lazy, Suspense } from "react";

// Lazy load — the picker bundle is heavy
const EmojiPicker = lazy(() => import("emoji-picker-react"));

export function EmojiPickerButton({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Add emoji"
      >
        <Smile className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-2">
          <Suspense fallback={<div className="h-80 w-72 rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">Loading emojis…</div>}>
            {/* @ts-ignore — types differ across versions */}
            <EmojiPicker
              onEmojiClick={(e: any) => { onPick(e.emoji); setOpen(false); }}
              theme={(document.documentElement.classList.contains("dark") ? "dark" : "light") as any}
              width={320}
              height={380}
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
