import { Link, useRouterState } from "@tanstack/react-router";
import { Hash, MessagesSquare, Video, Calendar, StickyNote } from "lucide-react";

const items = [
  { to: "/channels", label: "Channels", icon: Hash },
  { to: "/dm", label: "Messages", icon: MessagesSquare },
  { to: "/meetings", label: "Meetings", icon: Video },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/meeting-notes", label: "Notes", icon: StickyNote },
];

export const COMMUNICATION_PATHS = new Set(items.map((i) => i.to));

export function CommunicationSubNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!COMMUNICATION_PATHS.has(pathname)) return null;
  return (
    <div className="border-b border-border bg-card/40 px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
