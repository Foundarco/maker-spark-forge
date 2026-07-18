import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/hq/ai-gateway.server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/hq/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, module } = (await request.json()) as {
          messages?: UIMessage[];
          module?: string;
        };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Authenticate the caller so the assistant only sees what they can see (RLS).
        const authHeader = request.headers.get("Authorization") ?? "";
        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: authHeader ? { Authorization: authHeader } : {} },
        });

        // Best-effort workspace snapshot for grounding. RLS applies.
        const snapshot: Record<string, unknown> = {};
        try {
          const [{ data: me }, employees, tickets, work, deals, meetings, notifs] = await Promise.all([
            supabase.auth.getUser(),
            supabase.from("hr_employees").select("id", { count: "exact", head: true }).eq("status", "active"),
            supabase.from("cs_tickets").select("id, status", { count: "exact" }).not("status", "in", "(resolved,closed)"),
            supabase.from("mfg_work_orders").select("id, status", { count: "exact" }).not("status", "in", "(done,closed)"),
            supabase.from("sales_deals").select("amount, stage"),
            supabase.from("meetings").select("title, starts_at").gte("starts_at", new Date().toISOString()).order("starts_at").limit(5),
            supabase.from("notifications").select("title, body, created_at").order("created_at", { ascending: false }).limit(5),
          ]);
          const uid = me?.user?.id;
          let profile: any = null;
          if (uid) {
            const { data: p } = await supabase.from("profiles").select("full_name, email, department").eq("id", uid).maybeSingle();
            profile = p;
          }
          const pipeline = (deals.data || []).filter((d: any) => d.stage !== "won" && d.stage !== "lost").reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
          const won = (deals.data || []).filter((d: any) => d.stage === "won").reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
          snapshot.you = profile;
          snapshot.active_employees = employees.count ?? null;
          snapshot.open_tickets = tickets.count ?? null;
          snapshot.open_work_orders = work.count ?? null;
          snapshot.pipeline_value_usd = pipeline;
          snapshot.won_value_usd = won;
          snapshot.upcoming_meetings = meetings.data ?? [];
          snapshot.recent_notifications = notifs.data ?? [];
        } catch { /* snapshot is best-effort */ }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const systemPrompt = `You are the Clovr HQ assistant — an AI copilot embedded inside the internal operations platform used by staff at Clovr Lab, a 3D printer company.

You help with any operations question: engineering, manufacturing, sales, customer service, HR, finance, marketing, R&D, and general company operations.

The user is currently viewing module: ${module ?? "unknown"}.

You have live, read-only visibility into their workspace via row-level-security-scoped snapshots. Use these to give concrete, grounded answers instead of generic advice. If a data point is missing, say so.

Current workspace snapshot (this user's visibility only):
${JSON.stringify(snapshot, null, 2)}

Guidance:
- Be concise, direct, practical, use markdown.
- When asked "what's going on today" or "summarize", use the snapshot to name specific numbers, meetings, and notifications.
- When the user asks to *do* something (create a ticket, send an email, invite someone), explain the exact page in HQ to do it (e.g. "open /tickets → New").
- Never fabricate specific people, deals, or ticket numbers that aren't in the snapshot.`;

        const tools = buildTools(supabase);

        const result = streamText({
          model,
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(8),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});

function buildTools(supabase: SupabaseClient) {
  return {
    searchPeople: tool({
      description: "Search company staff by name. Use to look up who someone is or find their department/email.",
      inputSchema: z.object({ query: z.string().min(1).describe("Partial name to search") }),
      execute: async ({ query }) => {
        const { data } = await supabase.from("profiles").select("id, full_name, email, department").ilike("full_name", `%${query}%`).limit(10);
        return data ?? [];
      },
    }),
    listDeals: tool({
      description: "List sales deals visible to the user, optionally filtered by stage (e.g. 'won', 'lost', 'negotiation').",
      inputSchema: z.object({ stage: z.string().optional(), limit: z.number().int().min(1).max(50).default(20) }),
      execute: async ({ stage, limit }) => {
        let q = supabase.from("sales_deals").select("id, name, amount, stage, close_date").order("updated_at", { ascending: false }).limit(limit);
        if (stage) q = q.eq("stage", stage);
        const { data } = await q;
        return data ?? [];
      },
    }),
    listTickets: tool({
      description: "List customer service tickets, optionally filtered by status.",
      inputSchema: z.object({ status: z.string().optional(), limit: z.number().int().min(1).max(50).default(20) }),
      execute: async ({ status, limit }) => {
        let q = supabase.from("cs_tickets").select("id, subject, status, priority, customer_email, updated_at").order("updated_at", { ascending: false }).limit(limit);
        if (status) q = q.eq("status", status);
        const { data } = await q;
        return data ?? [];
      },
    }),
    listTasks: tool({
      description: "List engineering tasks. Filter by status or assignee_id (uuid).",
      inputSchema: z.object({ status: z.string().optional(), assignee_id: z.string().uuid().optional(), limit: z.number().int().min(1).max(50).default(20) }),
      execute: async ({ status, assignee_id, limit }) => {
        let q = supabase.from("eng_tasks").select("id, title, status, priority, assignee_id, due_date, updated_at").order("updated_at", { ascending: false }).limit(limit);
        if (status) q = q.eq("status", status);
        if (assignee_id) q = q.eq("assignee_id", assignee_id);
        const { data } = await q;
        return data ?? [];
      },
    }),
    upcomingMeetings: tool({
      description: "List meetings starting in the next N days (default 7).",
      inputSchema: z.object({ days: z.number().int().min(1).max(30).default(7) }),
      execute: async ({ days }) => {
        const end = new Date(); end.setDate(end.getDate() + days);
        const { data } = await supabase.from("meetings").select("id, title, starts_at, ends_at, host_id").gte("starts_at", new Date().toISOString()).lte("starts_at", end.toISOString()).order("starts_at").limit(20);
        return data ?? [];
      },
    }),
    workspaceStats: tool({
      description: "Get high-level KPIs: active employees, open tickets, open work orders, pipeline value.",
      inputSchema: z.object({}),
      execute: async () => {
        const [emp, tickets, work, deals] = await Promise.all([
          supabase.from("hr_employees").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("cs_tickets").select("id", { count: "exact", head: true }).not("status", "in", "(resolved,closed)"),
          supabase.from("mfg_work_orders").select("id", { count: "exact", head: true }).not("status", "in", "(done,closed)"),
          supabase.from("sales_deals").select("amount, stage"),
        ]);
        const pipeline = (deals.data || []).filter((d: any) => d.stage !== "won" && d.stage !== "lost").reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
        return {
          active_employees: emp.count ?? 0,
          open_tickets: tickets.count ?? 0,
          open_work_orders: work.count ?? 0,
          pipeline_value: pipeline,
        };
      },
    }),
  };
}
