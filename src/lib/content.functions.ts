import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

// ---- READS ----

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug,name,tagline,description,price_display,images,category,sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("products")
      .select("slug,name,tagline,description,price_display,images,specs,in_the_box,related_slugs,category")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt,category,author,published_at,cover_image")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("blog_posts")
      .select("slug,title,excerpt,body,category,author,published_at,cover_image")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listGuides = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("guides")
    .select("slug,title,symptom,category,difficulty")
    .eq("published", true)
    .order("category", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getGuide = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("guides")
      .select("slug,title,symptom,category,difficulty,body,steps")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ---- WRITES ----

const emailStr = z.string().email().max(200);

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      path: z.enum(["general", "support", "press", "partnership", "community"]),
      name: z.string().min(1).max(120),
      email: emailStr,
      subject: z.string().max(200).optional(),
      message: z.string().min(1).max(5000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("contact_submissions").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitInterest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      interest_type: z.enum(["ambassador", "contributor", "volunteer", "other"]),
      name: z.string().min(1).max(120),
      email: emailStr,
      location: z.string().max(200).optional(),
      message: z.string().max(3000).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("interest_submissions").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ email: emailStr, source: z.string().max(80).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("newsletter_signups").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      cart: z.array(z.object({ slug: z.string(), name: z.string(), quantity: z.number().int().min(1).max(20) })),
      subtotal_cents: z.number().int().min(0),
      name: z.string().min(1).max(120),
      email: emailStr,
      shipping_address: z.record(z.string()).optional(),
      notes: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        cart: data.cart,
        subtotal_cents: data.subtotal_cents,
        name: data.name,
        email: data.email,
        shipping_address: data.shipping_address ?? null,
        notes: data.notes ?? null,
        status: "pending_payment",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });
