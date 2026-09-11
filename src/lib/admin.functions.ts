import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function assertAdmin(claims: Record<string, unknown> | undefined) {
  const meta = (claims?.user_metadata as Record<string, unknown> | undefined) ?? {};
  const appMeta = (claims?.app_metadata as Record<string, unknown> | undefined) ?? {};
  const role = (meta.role as string | undefined) ?? (appMeta.role as string | undefined);
  if (role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
}

export const generateStrainInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ strainName: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims as Record<string, unknown>);

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `For the cannabis strain "${data.strainName}", provide detailed information based on public cannabis databases (Leafly, Weedmaps, etc.).

Return strictly JSON matching this shape:
{
  "effects": [5-6 short strings],
  "flavors": [4-6 short strings],
  "helps_with": [4-6 short strings],
  "negatives": [2-4 short strings],
  "lineage": "1-2 sentences on genetics/parents/breeder",
  "story": "3-4 sentence editorial cannabis-magazine narrative, warm and refined",
  "terpenes": [
    {"name": "Myrcene", "percentage": number, "descriptor": "short evocative descriptor"},
    {"name": "...", "percentage": number, "descriptor": "..."},
    {"name": "...", "percentage": number, "descriptor": "..."}
  ]
}

If you don't have reliable information on this strain, return: {"strain_unknown": true}

Tone: editorial cannabis-magazine. Warm, knowledgeable, never clinical. No medical claims.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You return only valid JSON. No prose, no markdown." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace > Usage.");
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error", res.status, t);
      throw new Error("AI generation failed");
    }

    const payload = await res.json();
    const text: string | undefined = payload.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty AI response");

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned non-JSON output");
      parsed = JSON.parse(m[0]);
    }

    return parsed as {
      effects?: string[];
      flavors?: string[];
      helps_with?: string[];
      negatives?: string[];
      lineage?: string;
      story?: string;
      terpenes?: Array<{ name: string; percentage: number; descriptor: string }>;
      strain_unknown?: boolean;
    };
  });

const StrainUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  story: z.string().max(4000).optional().nullable(),
  lineage: z.string().max(2000).optional().nullable(),
  flavor_tags: z.array(z.string().max(50)).max(20).optional(),
  effects: z.array(z.string().max(50)).max(20).optional(),
  helps_with: z.array(z.string().max(80)).max(20).optional(),
  negatives: z.array(z.string().max(80)).max(20).optional(),
  terpene_breakdown: z
    .array(
      z.object({
        name: z.string().max(50),
        percentage: z.number().min(0).max(100),
        descriptor: z.string().max(200),
      }),
    )
    .max(10)
    .optional(),
  // Commerce fields
  price_zar: z.number().min(0).max(100000).optional(),
  stock_quantity: z.number().int().min(0).max(1000000).optional(),
  is_active: z.boolean().optional(),
  product_image_url: z.string().max(600).optional().nullable(),
});

export const adminUpdateStrain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StrainUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims as Record<string, unknown>);
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("strains").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminGetStrain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims as Record<string, unknown>);
    const { data: row, error } = await supabaseAdmin
      .from("strains")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminListStrains = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    assertAdmin(context.claims as Record<string, unknown>);
    const { data, error } = await supabaseAdmin
      .from("strains")
      .select("id,slug,name,product_line,is_active,display_order,price_zar,stock_quantity")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Admin view of the protected wholesale configuration and tier ladder. */
export const adminGetWholesalePricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ strain_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims as Record<string, unknown>);
    const [{ data: product }, { data: tiers }] = await Promise.all([
      supabaseAdmin
        .from("wholesale_products")
        .select("strain_id,units_per_box,minimum_boxes,wholesale_active")
        .eq("strain_id", data.strain_id)
        .maybeSingle(),
      supabaseAdmin
        .from("wholesale_price_tiers")
        .select("min_boxes,max_boxes,price_per_box_zar")
        .eq("strain_id", data.strain_id)
        .order("min_boxes", { ascending: true }),
    ]);
    return { product, tiers: tiers ?? [] };
  });

const TierSchema = z.object({
  min_boxes: z.number().int().min(1).max(10000),
  max_boxes: z.number().int().min(1).max(10000).nullable(),
  price_per_box_zar: z.number().min(0).max(1000000),
});

export const adminUpdateWholesalePricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        strain_id: z.string().uuid(),
        units_per_box: z.number().int().min(1).max(1000),
        minimum_boxes: z.number().int().min(1).max(1000),
        wholesale_active: z.boolean(),
        tiers: z.array(TierSchema).min(1).max(12),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims as Record<string, unknown>);

    const sorted = [...data.tiers].sort((a, b) => a.min_boxes - b.min_boxes);
    // Contiguous, gap-free ladder ending in one open-ended tier.
    if (sorted[0].min_boxes !== 1) {
      return { ok: false as const, error: "The first tier must start at 1 box." };
    }
    for (let i = 0; i < sorted.length; i++) {
      const t = sorted[i];
      const isLast = i === sorted.length - 1;
      if (isLast) {
        if (t.max_boxes !== null) return { ok: false as const, error: "The last tier must be open-ended." };
      } else {
        if (t.max_boxes === null) return { ok: false as const, error: "Only the last tier may be open-ended." };
        if (t.max_boxes < t.min_boxes) return { ok: false as const, error: "A tier cannot end before it starts." };
        if (sorted[i + 1].min_boxes !== t.max_boxes + 1) {
          return { ok: false as const, error: "Tiers must be contiguous with no gaps or overlaps." };
        }
      }
    }

    const { error: pErr } = await supabaseAdmin.from("wholesale_products").upsert(
      {
        strain_id: data.strain_id,
        units_per_box: data.units_per_box,
        minimum_boxes: data.minimum_boxes,
        wholesale_active: data.wholesale_active,
      },
      { onConflict: "strain_id" },
    );
    if (pErr) throw new Error(pErr.message);

    const { error: dErr } = await supabaseAdmin
      .from("wholesale_price_tiers")
      .delete()
      .eq("strain_id", data.strain_id);
    if (dErr) throw new Error(dErr.message);

    const { error: iErr } = await supabaseAdmin
      .from("wholesale_price_tiers")
      .insert(sorted.map((t) => ({ ...t, strain_id: data.strain_id })));
    if (iErr) throw new Error(iErr.message);

    return { ok: true as const };
  });