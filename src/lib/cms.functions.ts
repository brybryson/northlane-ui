import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/* --------------------------- Public reads --------------------------- */

export const listJournalPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("journal_posts")
    .select("id, tag, title, read_time, image_url, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export const listCustomerStories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("customer_stories")
    .select("id, customer_name, customer_role, quote, body, image_url, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

/* --------------------------- Admin helpers --------------------------- */

async function assertAdmin(ctx: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin role required");
}

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

/* --------------------------- Journal admin CRUD --------------------------- */

const journalUpsert = z.object({
  id: z.string().uuid().optional(),
  tag: z.string().min(1).max(40),
  title: z.string().min(1).max(200),
  read_time: z.string().min(1).max(20),
  image_url: z.string().max(2000).optional().nullable(),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const upsertJournalPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => journalUpsert.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = { ...data, image_url: data.image_url || null };
    const q = data.id
      ? context.supabase.from("journal_posts").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("journal_posts").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw error;
    return row;
  });

export const deleteJournalPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("journal_posts").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* --------------------------- Story admin CRUD --------------------------- */

const storyUpsert = z.object({
  id: z.string().uuid().optional(),
  customer_name: z.string().min(1).max(120),
  customer_role: z.string().max(200).optional().nullable(),
  quote: z.string().min(1).max(400),
  body: z.string().max(2000).optional().nullable(),
  image_url: z.string().max(2000).optional().nullable(),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const upsertCustomerStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => storyUpsert.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      ...data,
      customer_role: data.customer_role || null,
      body: data.body || null,
      image_url: data.image_url || null,
    };
    const q = data.id
      ? context.supabase
          .from("customer_stories")
          .update(payload)
          .eq("id", data.id)
          .select()
          .single()
      : context.supabase.from("customer_stories").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw error;
    return row;
  });

export const deleteCustomerStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("customer_stories").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
