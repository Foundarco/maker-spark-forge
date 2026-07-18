import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Phone, MessageSquare, Mail, Calendar as CalIcon } from "lucide-react";

type Props = {
  scope: string; // for localStorage key per module
  profile: ReactNode;
  activity?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
};

export function RecordLayout({ scope, profile, activity, header, children }: Props) {
  const leftKey = `hq.record.${scope}.left`;
  const rightKey = `hq.record.${scope}.right`;
  const [leftHidden, setLeftHidden] = useState(false);
  const [rightHidden, setRightHidden] = useState(false);

  useEffect(() => {
    try {
      setLeftHidden(localStorage.getItem(leftKey) === "1");
      setRightHidden(localStorage.getItem(rightKey) === "1");
    } catch {}
  }, [leftKey, rightKey]);

  const toggleLeft = () => {
    const v = !leftHidden;
    setLeftHidden(v);
    try { localStorage.setItem(leftKey, v ? "1" : "0"); } catch {}
  };
  const toggleRight = () => {
    const v = !rightHidden;
    setRightHidden(v);
    try { localStorage.setItem(rightKey, v ? "1" : "0"); } catch {}
  };

  return (
    <div className="flex h-full min-h-0 w-full">
      {/* Left profile rail */}
      <aside
        className={`relative hidden flex-shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:block ${
          leftHidden ? "w-0" : "w-[320px]"
        }`}
      >
        {!leftHidden && <div className="h-full overflow-y-auto p-4">{profile}</div>}
        <button
          onClick={toggleLeft}
          className="absolute -right-3 top-6 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground lg:flex"
          aria-label={leftHidden ? "Show profile" : "Hide profile"}
        >
          {leftHidden ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main */}
      <section className="flex min-w-0 flex-1 flex-col">
        {header && <div className="border-b border-border bg-background px-5 py-3">{header}</div>}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </section>

      {/* Right activity rail */}
      {activity && (
        <aside
          className={`relative hidden flex-shrink-0 border-l border-border bg-card transition-[width] duration-200 xl:block ${
            rightHidden ? "w-0" : "w-[320px]"
          }`}
        >
          {!rightHidden && <div className="h-full overflow-y-auto p-4">{activity}</div>}
          <button
            onClick={toggleRight}
            className="absolute -left-3 top-6 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground xl:flex"
            aria-label={rightHidden ? "Show activity" : "Hide activity"}
          >
            {rightHidden ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        </aside>
      )}
    </div>
  );
}

// ---------- Building blocks ----------

export function ProfileCard({
  name,
  subtitle,
  tags,
  email,
  phone,
  fields,
  onCall,
  onMessage,
  onEmail,
  onSchedule,
}: {
  name: string;
  subtitle?: string;
  tags?: { label: string; tone?: "primary" | "success" | "muted" }[];
  email?: string | null;
  phone?: string | null;
  fields?: { label: string; value: ReactNode }[];
  onCall?: () => void;
  onMessage?: () => void;
  onEmail?: () => void;
  onSchedule?: () => void;
}) {
  const initials = name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-sm font-bold text-primary">
          {initials || "•"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-foreground">{name}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => {
            const tone =
              t.tone === "success"
                ? "border-success/25 bg-success-soft text-success"
                : t.tone === "muted"
                ? "border-border bg-muted text-muted-foreground"
                : "border-primary/20 bg-primary-soft text-primary";
            return (
              <span key={i} className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>
                {t.label}
              </span>
            );
          })}
        </div>
      )}

      {(email || phone) && (
        <div className="space-y-1.5 rounded-xl border border-border bg-background p-3 text-xs">
          {email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate text-foreground">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground">{phone}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <QuickBtn icon={MessageSquare} label="Message" onClick={onMessage} tone="primary" />
        <QuickBtn icon={Phone} label="Call" onClick={onCall} />
        <QuickBtn icon={Mail} label="Email" onClick={onEmail} />
        <QuickBtn icon={CalIcon} label="Schedule" onClick={onSchedule} />
      </div>

      {fields && fields.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Details</p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            {fields.map((f, i) => (
              <div key={i} className="min-w-0">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 truncate text-foreground">{f.value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

function QuickBtn({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  tone?: "primary";
}) {
  const cls =
    tone === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-background text-foreground hover:bg-muted";
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export type ActivityEvent = {
  id: string;
  icon?: any;
  title: ReactNode;
  meta?: ReactNode;
  timestamp?: string;
  tone?: "default" | "success" | "warn" | "primary";
};

export function ActivityRail({ title = "Activity", events }: { title?: string; events: ActivityEvent[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
        <span className="text-[10px] text-muted-foreground">{events.length}</span>
      </div>
      <ol className="relative space-y-4 border-l border-border pl-4">
        {events.map((e) => {
          const Icon = e.icon;
          const dot =
            e.tone === "success"
              ? "bg-success"
              : e.tone === "warn"
              ? "bg-[color:var(--accent-warn)]"
              : e.tone === "primary"
              ? "bg-primary"
              : "bg-muted-foreground/50";
          return (
            <li key={e.id} className="relative">
              <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-card ${dot}`} />
              <div className="flex items-start gap-2">
                {Icon && <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />}
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-foreground">{e.title}</div>
                  {e.meta && <div className="mt-0.5 text-[11px] text-muted-foreground">{e.meta}</div>}
                  {e.timestamp && <div className="mt-0.5 text-[10px] text-muted-foreground">{e.timestamp}</div>}
                </div>
              </div>
            </li>
          );
        })}
        {events.length === 0 && <li className="text-xs text-muted-foreground">No activity yet.</li>}
      </ol>
    </div>
  );
}
