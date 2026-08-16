import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SlackSettings = {
  workspaceUrl: string;
  /** unit slug -> slack channel name (without #) */
  channels: Record<string, string>;
};

const EMPTY: SlackSettings = { workspaceUrl: "", channels: {} };

export async function loadSlackSettings(): Promise<SlackSettings> {
  const { data } = await supabase.from("admin_settings").select("key, value").eq("category", "slack");
  const out: SlackSettings = { workspaceUrl: "", channels: {} };
  for (const row of (data ?? []) as any[]) {
    if (row.key === "workspace_url") out.workspaceUrl = row.value ?? "";
    else if (row.key.startsWith("channel.")) out.channels[row.key.slice("channel.".length)] = row.value ?? "";
  }
  return out;
}

export async function saveSlackSettings(s: SlackSettings) {
  const rows = [
    { category: "slack", key: "workspace_url", value: s.workspaceUrl },
    ...Object.entries(s.channels)
      .filter(([, v]) => (v ?? "").trim().length > 0)
      .map(([k, v]) => ({ category: "slack", key: `channel.${k}`, value: v.trim().replace(/^#/, "") })),
  ].filter((r) => (r.value ?? "").length > 0);
  await supabase.from("admin_settings").delete().eq("category", "slack");
  if (rows.length) await supabase.from("admin_settings").insert(rows as any);
}

export function useSlackSettings() {
  const [settings, setSettings] = useState<SlackSettings>(EMPTY);
  useEffect(() => {
    let alive = true;
    loadSlackSettings().then((s) => { if (alive) setSettings(s); });
    return () => { alive = false; };
  }, []);
  return settings;
}

/** Deep link into the Slack workspace (channel optional). */
export function slackLink(s: SlackSettings, channel?: string | null) {
  if (!s.workspaceUrl) return null;
  const base = s.workspaceUrl.replace(/\/+$/, "");
  return channel ? `${base}/app_redirect?channel=${encodeURIComponent(channel)}` : base;
}
