import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public aid-request intake for Clovr Relief. Stored in `project_requests`:
// project_type = hazard/need category, address = location, timeline = urgency,
// budget = household size.
const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(60).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  projectType: z.enum([
    "water",
    "medical",
    "shelter",
    "power-comms",
    "evacuation",
    "recovery-repair",
    "other",
  ]),
  budget: z.string().trim().max(60).optional().default(""),
  timeline: z.string().trim().max(60).optional().default(""),
  description: z.string().trim().min(10, "Tell us a little more").max(4000),
  additionalInfo: z.string().trim().max(2000).optional().default(""),
  photoUrls: z.array(z.string().trim().max(500)).max(10).optional().default([]),
});


export const submitProjectRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("project_requests" as never)
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        project_type: data.projectType,
        budget: data.budget || null,
        timeline: data.timeline || null,
        description: data.description,
        additional_info: data.additionalInfo || null,
        photo_urls: data.photoUrls,
        status: "new",
      } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
