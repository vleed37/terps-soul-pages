import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PublicReview = {
  id: string;
  rating: number;
  body: string;
  submitted_at: string;
  display_name: string;
  verified_purchase: boolean;
};

export type RatingSummary = {
  count: number;
  average: number | null;
  breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
};

/** "Jane Doe" -> "Jane D." — never the full surname, email, order or account id. */
function maskName(fullName: string | null | undefined): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Verified customer";
  const first = parts[0]!;
  if (parts.length === 1) return first;
  return `${first} ${parts[parts.length - 1]!.charAt(0).toUpperCase()}.`;
}

/** Defence in depth: the trigger strips markup on write, we strip again on read. */
function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

const StrainIdInput = z.object({ strainId: z.string().uuid() });

/**
 * Public: approved reviews only, plus the aggregate from approved reviews only.
 * The verified-purchase mark is derived server-side — every approved review
 * comes from a customer whose paid order contained the product.
 */
export const getStrainReviews = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => StrainIdInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("product_reviews")
      .select("id, rating, body, submitted_at, customer_id")
      .eq("strain_id", data.strainId)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    const ids = [...new Set((rows ?? []).map((r) => r.customer_id))];
    const names = new Map<string, string>();
    if (ids.length > 0) {
      const { data: customers } = await supabaseAdmin
        .from("customers")
        .select("id, full_name")
        .in("id", ids);
      for (const c of customers ?? []) names.set(c.id, maskName(c.full_name));
    }

    const { data: summaryRaw, error: sErr } = await supabaseAdmin.rpc("strain_rating_summary", {
      _strain_id: data.strainId,
    });
    if (sErr) throw new Error(sErr.message);

    const reviews: PublicReview[] = (rows ?? []).map((r) => ({
      id: r.id,
      rating: r.rating,
      body: plainText(r.body),
      submitted_at: r.submitted_at,
      display_name: names.get(r.customer_id) ?? "Verified customer",
      verified_purchase: true,
    }));

    return {
      reviews,
      summary: (summaryRaw as unknown as RatingSummary) ?? {
        count: 0,
        average: null,
        breakdown: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      },
    };
  });

/** Signed-in: whether this customer may review, and their existing review. */
export const getMyReviewState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StrainIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: eligible, error: eErr } = await supabase.rpc("has_purchased_strain", {
      _customer_id: userId,
      _strain_id: data.strainId,
    });
    if (eErr) throw new Error(eErr.message);

    const { data: mine, error } = await supabase
      .from("product_reviews")
      .select("id, rating, body, status, submitted_at")
      .eq("strain_id", data.strainId)
      .eq("customer_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    return { canReview: eligible === true, review: mine ?? null };
  });

const ReviewInput = z.object({
  strainId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(20).max(2000),
});

/**
 * Insert or update the caller's own review. Runs as the signed-in user, so the
 * purchase check, one-per-product rule, rate limit and pending status are all
 * enforced by the database, not by the browser.
 */
export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ReviewInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("strain_id", data.strainId)
      .eq("customer_id", userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("product_reviews")
        .update({ rating: data.rating, body: data.body })
        .eq("id", existing.id)
        .eq("customer_id", userId);
      if (error) throw new Error(error.message);
      return { ok: true as const, status: "pending" as const, updated: true };
    }

    const { error } = await supabase.from("product_reviews").insert({
      customer_id: userId,
      strain_id: data.strainId,
      rating: data.rating,
      body: data.body,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, status: "pending" as const, updated: false };
  });

/** Anyone can flag a published review. Reports are readable by admins only. */
export const reportReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ reviewId: z.string().uuid(), reason: z.string().trim().min(3).max(500) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("review_reports").insert({
      review_id: data.reviewId,
      reason: data.reason.replace(/<[^>]*>/g, ""),
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
