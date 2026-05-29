import { toast } from "sonner";
export function cartLaunchingSoon() {
  toast("Cart launching soon", {
    description: "Send an inquiry to sales@terpnation.co.za and we'll sort you out.",
    duration: 5000,
  });
}
