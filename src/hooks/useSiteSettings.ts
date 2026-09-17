import { useQuery } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/settings.functions";
import type { SettingsMap } from "@/lib/settings";

export const siteSettingsQuery = {
  queryKey: ["site-settings"] as const,
  queryFn: () => getSiteSettings(),
  staleTime: 5 * 60 * 1000,
};

/** Owner-supplied operational settings. Empty object while loading. */
export function useSiteSettings(): SettingsMap {
  const { data } = useQuery(siteSettingsQuery);
  return data ?? {};
}
