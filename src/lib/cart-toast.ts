import { toast } from "sonner";
import { SALES_EMAIL } from "@/lib/brand";
export function cartLaunchingSoon() {
  toast("Cart launching soon", {
    description: `Send an inquiry to ${SALES_EMAIL} and we'll sort you out.`,
    duration: 5000,
  });
}
