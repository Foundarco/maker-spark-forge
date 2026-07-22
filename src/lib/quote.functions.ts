import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(60).optional().default(""),
  stage: z.enum(["idea", "sketch", "prototype", "ready-to-manufacture", "in-production"]),
  service: z.enum(["product-development", "prototyping", "manufacturing", "not-sure"]),
  budget: z.string().trim().max(60).optional().default(""),
  timeline: z.string().trim().max(60).optional().default(""),
  description: z.string().trim().min(10).max(4000),
});

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("quote_requests" as never)
      .insert({
        name: data.name,
        email: data.email,
        company: data.company || null,
        phone: data.phone || null,
        stage: data.stage,
        service: data.service,
        budget: data.budget || null,
        timeline: data.timeline || null,
        description: data.description,
        status: "new",
      } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
