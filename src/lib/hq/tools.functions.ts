/**
 * Server-side tool implementations that the HQ AI assistant can call.
 * These run as the signed-in user through requireSupabaseAuth, so RLS
 * is enforced automatically — the assistant sees only what the user sees.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SearchPeople = z.object({ query: z.string().min(1).max(60) });
export const toolSearchPeople = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => SearchPeople.parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, department")
      .ilike("full_name", `%${data.query}%`)
      .limit(10);
    return rows ?? [];
  });

const ListDeals = z.object({ stage: z.string().optional(), limit: z.number().min(1).max(50).default(20) });
export const toolListDeals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ListDeals.parse(i))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("sales_deals").select("id, name, amount, stage, close_date").order("updated_at", { ascending: false }).limit(data.limit);
    if (data.stage) q = q.eq("stage", data.stage);
    const { data: rows } = await q;
    return rows ?? [];
  });

const ListTickets = z.object({ status: z.string().optional(), limit: z.number().min(1).max(50).default(20) });
export const toolListTickets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ListTickets.parse(i))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("cs_tickets").select("id, subject, status, priority, customer_email, updated_at").order("updated_at", { ascending: false }).limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows } = await q;
    return rows ?? [];
  });

const ListTasks = z.object({ assignee_id: z.string().uuid().optional(), status: z.string().optional(), limit: z.number().min(1).max(50).default(20) });
export const toolListTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ListTasks.parse(i))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("eng_tasks").select("id, title, status, priority, assignee_id, due_date, updated_at").order("updated_at", { ascending: false }).limit(data.limit);
    if (data.assignee_id) q = q.eq("assignee_id", data.assignee_id);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows } = await q;
    return rows ?? [];
  });

const UpcomingMeetings = z.object({ days: z.number().min(1).max(30).default(7) });
export const toolUpcomingMeetings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => UpcomingMeetings.parse(i))
  .handler(async ({ data, context }) => {
    const end = new Date(); end.setDate(end.getDate() + data.days);
    const { data: rows } = await context.supabase
      .from("meetings")
      .select("id, title, starts_at, ends_at, host_id")
      .gte("starts_at", new Date().toISOString())
      .lte("starts_at", end.toISOString())
      .order("starts_at")
      .limit(20);
    return rows ?? [];
  });

const WorkspaceStats = z.object({});
export const toolWorkspaceStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => WorkspaceStats.parse(i))
  .handler(async ({ context }) => {
    const [emp, tickets, deals, work] = await Promise.all([
      context.supabase.from("hr_employees").select("id", { count: "exact", head: true }).eq("status", "active"),
      context.supabase.from("cs_tickets").select("id", { count: "exact", head: true }).not("status", "in", "(resolved,closed)"),
      context.supabase.from("sales_deals").select("amount, stage"),
      context.supabase.from("mfg_work_orders").select("id", { count: "exact", head: true }).not("status", "in", "(done,closed)"),
    ]);
    const pipeline = (deals.data || []).filter((d: any) => d.stage !== "won" && d.stage !== "lost").reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
    return {
      active_employees: emp.count ?? 0,
      open_tickets: tickets.count ?? 0,
      open_work_orders: work.count ?? 0,
      pipeline_value: pipeline,
    };
  });
