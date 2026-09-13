import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Deletes the signed-in account and anonymises its data, while retaining the
 * order records the business must keep. Orders are detached from the deleted
 * account (customer_id cleared) with the buyer details preserved on the order
 * itself, so financial records stay intact without pointing at a live profile.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = typeof (claims as { email?: unknown })?.email === "string" ? ((claims as { email: string }).email) : null;

    const { data: profile } = await supabaseAdmin
      .from("customers")
      .select("full_name, phone")
      .eq("id", userId)
      .maybeSingle();

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("id, guest_email, guest_name, guest_phone")
      .eq("customer_id", userId);

    for (const o of orders ?? []) {
      await supabaseAdmin
        .from("orders")
        .update({
          customer_id: null,
          guest_email: o.guest_email ?? email,
          guest_name: o.guest_name ?? profile?.full_name ?? "Deleted account",
          guest_phone: o.guest_phone ?? profile?.phone ?? null,
        })
        .eq("id", o.id);
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { ok: true, ordersRetained: orders?.length ?? 0 };
  });
