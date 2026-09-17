import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SettingsMap } from "@/lib/settings";

/**
 * Server-only settings read for order/pricing paths. Checkout must never trust
 * a client-supplied fee — it resolves the configured values here.
 */
export async function loadSettings(): Promise<SettingsMap> {
  const { data, error } = await supabaseAdmin.from("app_config").select("key,value");
  if (error) {
    console.warn("[settings.server] read failed", error.message);
    return {};
  }
  const map: SettingsMap = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
}
