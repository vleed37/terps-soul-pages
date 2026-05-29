import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useWholesaleAccount } from "@/hooks/useWholesaleAccount";

const DISMISS_KEY = "terps:stockist-banner-dismissed";

export function StockistContextBanner() {
  const { account } = useWholesaleAccount();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (dismissed) return null;
  if (!account || account.approval_status !== "approved") return null;
  if (pathname.startsWith("/wholesale/dashboard")) return null;

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-0 top-[28px] z-40 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)]">
      <Link
        to="/wholesale/dashboard"
        className="group flex items-center justify-center gap-3 px-6 py-3 text-center transition-colors hover:bg-[color:var(--sage-muted,#e8ede0)]"
      >
        <span className="text-[13px] text-[color:var(--text-secondary)]">
          <span className="hidden sm:inline">Signed in as </span>
          <span className="font-display italic text-[color:var(--text-primary)]">
            {account.business_name}
          </span>
          <span className="hidden sm:inline"> — Go to stockist portal</span>
          <span className="sm:hidden"> → Portal</span>
          <span className="ml-2 inline-block text-[color:var(--accent-gold)] transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[color:var(--text-tertiary)] hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-primary)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}