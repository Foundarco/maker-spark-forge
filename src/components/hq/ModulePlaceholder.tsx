import { Construction, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  group: string;
  description?: string;
  icon?: any;
  warning?: string;
  children?: ReactNode;
};

export function ModulePlaceholder({ title, group, description, icon: Icon = Construction, warning, children }: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {group}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      {description && (
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
      )}

      {warning && (
        <div className="mt-6 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
          <p className="text-amber-200/90">{warning}</p>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
        <Construction className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Module scaffolded — build in progress</p>
        <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
          This module's UI, data model, and workflows will be built out in a future phase. The
          route, sidebar entry, and permissions are already wired.
        </p>
      </div>

      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
