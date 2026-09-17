import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SettingsMap } from "@/lib/settings";

/**
 * Public, unauthenticated read of the operational settings stored in
 * `app_config`. Safe for SSR and prerender: publishable key only, and the table
 * holds nothing but owner-supplied public values (no credentials).
 */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SettingsMap> => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return {};

    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
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

    const { data, error } = await client.from("app_config").select("key,value");
    if (error) {
      console.warn("[settings] read failed", error.message);
      return {};
    }
    const map: SettingsMap = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return map;
  },
);
