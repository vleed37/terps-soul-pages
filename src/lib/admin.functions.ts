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

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned non-JSON output");
      parsed = JSON.parse(m[0]);
    }

    return parsed;
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
      .select("id,slug,name,product_line,is_active,display_order")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });