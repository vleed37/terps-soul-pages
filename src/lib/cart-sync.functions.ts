import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ItemInput = z.object({
  strainId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const mergeCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ items: z.array(ItemInput).max(50) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1) Ensure single cart row for this customer
    const { data: existing } = await supabase
      .from("carts")
      .select("id")
      .eq("customer_id", userId)
      .maybeSingle();

    let cartId = existing?.id as string | undefined;
    if (!cartId) {
      const { data: created, error } = await supabase
        .from("carts")
        .insert({ customer_id: userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      cartId = created.id;
    }

    // 2) Load existing server cart items
    const { data: serverItems } = await supabase
      .from("cart_items")
      .select("id, strain_id, quantity")
      .eq("cart_id", cartId);

    const serverMap = new Map<string, { id: string; quantity: number }>();
    for (const it of serverItems ?? []) {
      if (it.strain_id) serverMap.set(it.strain_id, { id: it.id, quantity: it.quantity });
    }

    // 3) Validate strain ids + stock
    const incomingIds = data.items.map((i) => i.strainId);
    const allIds = Array.from(new Set([...incomingIds, ...serverMap.keys()]));
    if (allIds.length > 0) {
      const { data: strains } = await supabase
        .from("strains")
        .select("id, stock_quantity, is_active")
        .in("id", allIds);
      const stockMap = new Map((strains ?? []).map((s) => [s.id, s]));

      // 4) Merge: server qty + incoming qty, capped at stock
      for (const inItem of data.items) {
        const s = stockMap.get(inItem.strainId);
        if (!s || !s.is_active || s.stock_quantity <= 0) continue;
        const existingRow = serverMap.get(inItem.strainId);
        const merged = Math.min(
          s.stock_quantity,
          (existingRow?.quantity ?? 0) + inItem.quantity,
        );
        if (existingRow) {
          await supabase.from("cart_items").update({ quantity: merged }).eq("id", existingRow.id);
        } else {
          await supabase
            .from("cart_items")
            .insert({ cart_id: cartId, strain_id: inItem.strainId, quantity: merged });
        }
      }
    }

    // 5) Return merged set with full strain detail for rehydration
    const { data: finalItems } = await supabase
      .from("cart_items")
      .select("strain_id, quantity, strains:strain_id(id, slug, name, price_zar, weight_grams, stock_quantity, accent_color_primary, accent_color_accent)")
      .eq("cart_id", cartId);

    return {
      items: (finalItems ?? [])
        .filter((it) => it.strains)
        .map((it) => {
          const s = it.strains as unknown as {
            id: string;
            slug: string;
            name: string;
            price_zar: number;
            weight_grams: number | null;
            stock_quantity: number;
            accent_color_primary: string | null;
            accent_color_accent: string | null;
          };
          return {
            strainId: s.id,
            slug: s.slug,
            name: s.name,
            priceZar: Number(s.price_zar),
            weightGrams: Number(s.weight_grams ?? 0.75),
            maxStock: s.stock_quantity,
            accentPrimary: s.accent_color_primary ?? undefined,
            accentAccent: s.accent_color_accent ?? undefined,
            quantity: it.quantity,
          };
        }),
    };
  });

export const clearMyServerCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("customer_id", userId)
      .maybeSingle();
    if (cart) {
      await supabase.from("cart_items").delete().eq("cart_id", cart.id);
    }
    return { ok: true };
  });
