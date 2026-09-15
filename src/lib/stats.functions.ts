import { createServerFn } from "@tanstack/react-start";

/**
 * Total joints sold: units from verified paid orders only, plus the
 * owner-configured historical baseline (`app_config.joints_sold_baseline`,
 * which stays at 0 until a documented figure is supplied).
 *
 * The database function returns a single number — no customer, order or
 * revenue data crosses this boundary. Cart additions are never counted.
 * Cached client-side for 5 minutes (see JOINTS_SOLD_REFRESH_MS).
 */
export const getJointsSoldTotal = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("joints_sold_total");
  if (error) throw new Error(error.message);
  return { total: Number(data ?? 0) };
});

/** Documented refresh interval for the counter. */
export const JOINTS_SOLD_REFRESH_MS = 5 * 60 * 1000;
