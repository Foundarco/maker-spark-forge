import { Link, useRouterState } from "@tanstack/react-router";
import { Hash, MessagesSquare, Video, StickyNote, Phone, Bot } from "lucide-react";

const items = [
  { to: "/channels", label: "Channels", icon: Hash },
  { to: "/dm", label: "Messages", icon: MessagesSquare },
  { to: "/phone", label: "Calls", icon: Phone },
  { to: "/meetings", label: "Meetings", icon: Video },
  { to: "/meeting-notes", label: "Notes", icon: StickyNote },
];

const apps = [{ to: "/assistant", label: "Assistant", icon: Bot }];

export const COMMUNICATION_PATHS = new Set([
  ...items.map((i) => i.to),
  "/assistant",
]);

export function CommsRail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!COMMUNICATION_PATHS.has(pathname)) return null;

  const Item = ({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Hash }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        title={label}
        aria-label={label}
        className={`group flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-medium transition ${
          active
            ? "bg-primary/12 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 group-hover:bg-muted"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex w-[68px] shrink-0 flex-col gap-1 border-r border-border bg-card/50 px-2 py-3">
      {items.map((it) => (
        <Item key={it.to} {...it} />
      ))}
      <div className="my-2 h-px bg-border" />
      <p className="pb-1 text-center text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Apps</p>
      {apps.map((it) => (
        <Item key={it.to} {...it} />
      ))}
    </nav>
  );
}
