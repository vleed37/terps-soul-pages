import { useSiteSettings } from "@/hooks/useSiteSettings";
import { business } from "@/lib/settings";

/**
 * Canonical business/legal details for public pages: admin-supplied values win,
 * already-confirmed constants are kept, anything still outstanding stays null so
 * the page renders an honest "to be confirmed".
 */
export function useBusiness() {
  return business(useSiteSettings());
}
