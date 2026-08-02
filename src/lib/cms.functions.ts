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

/* --------------------------- Products admin CRUD --------------------------- */

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

const productUpsert = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string(),
  category: z.string().min(1),
  brand: z.string().min(1),
  price: z.number(),
  original_price: z.number().nullable().optional(),
  image_url: z.string().min(1),
  gallery: z.array(z.string()).default([]),
  description: z.string(),
  in_stock: z.boolean().default(true),
  stock_count: z.number().default(0),
  featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  attributes: z.any().default({}),
  specs: z.any().default({}),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productUpsert.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("products")
      .upsert(data);
    if (error) throw error;
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ----------------------- Inventory stock update ----------------------- */

export const updateProductStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string(),
      stock_count: z.number().min(0),
      in_stock: z.boolean(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("products")
      .update({ stock_count: data.stock_count, in_stock: data.in_stock })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ----------------------- Public product list (for shop) ----------------------- */

export const listPublicProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("products")
    .select("id, stock_count, in_stock, price, original_price, featured, is_new, is_bestseller, attributes")
    .order("created_at", { ascending: true });
  if (error) {
    // graceful fallback – don't crash the shop if table doesn't exist yet
    console.error("[listPublicProducts]", error.message);
    return [];
  }
  return data ?? [];
});

/* ------------------- Stock Adjustment Audit Trail ------------------- */

const adjustmentTypes = z.enum(["received", "returned", "damaged", "correction", "written_off", "reserved"]);

export const recordStockAdjustment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      product_id: z.string(),
      adjustment_type: adjustmentTypes,
      quantity_change: z.number().int(),
      quantity_before: z.number().int().min(0),
      notes: z.string().optional(),
      reference: z.string().optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const quantity_after = Math.max(0, data.quantity_before + data.quantity_change);

    // Insert audit log entry
    const { error: logError } = await context.supabase.from("stock_adjustments").insert({
      product_id: data.product_id,
      adjustment_type: data.adjustment_type,
      quantity_change: data.quantity_change,
      quantity_before: data.quantity_before,
      quantity_after,
      notes: data.notes ?? null,
      reference: data.reference ?? null,
      created_by: context.userId,
    });
    if (logError) throw logError;

    // Update the product stock
    const { error: stockError } = await context.supabase
      .from("products")
      .update({ stock_count: quantity_after, in_stock: quantity_after > 0 })
      .eq("id", data.product_id);
    if (stockError) throw stockError;

    return { quantity_after };
  });

export const listStockAdjustments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ product_id: z.string().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let query = context.supabase
      .from("stock_adjustments")
      .select("*, products(name, image_url, category)")
      .order("created_at", { ascending: false })
      .limit(60);

    if (data.product_id) {
      query = query.eq("product_id", data.product_id) as typeof query;
    }
    const { data: rows, error } = await query;
    if (error) throw error;
    return rows ?? [];
  });
