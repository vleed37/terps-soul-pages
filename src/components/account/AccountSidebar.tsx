import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/store/cart";

const TABS: ReadonlyArray<{ to: string; label: string; exact?: boolean }> = [
  { to: "/account", label: "OVERVIEW", exact: true },
  { to: "/account/orders", label: "ORDERS" },
  { to: "/account/addresses", label: "ADDRESSES" },
  { to: "/account/settings", label: "SETTINGS" },
];

export function AccountSidebar({ firstName }: { firstName?: string | null }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const clearCart = useCart((s) => s.clear);

  async function signOut() {
    await supabase.auth.signOut();
    clearCart();
    window.location.href = "/";
  }

  return (
    <aside className="md:w-[240px] md:shrink-0">
      <div className="hidden md:block">
        <Logo height={44} />
        <hr className="hairline-gold mt-6" />
        {firstName && (
          <p className="mt-6 font-display italic text-sm text-[color:var(--text-secondary)]">
            Welcome, {firstName}.
          </p>
        )}
        <nav className="mt-8 flex flex-col">
          {TABS.map((t) => {
            const active = t.exact ? path === t.to : path.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to as any}
                className="relative meta-xs py-4 transition-colors"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                  paddingLeft: 16,
                }}
              >
                {active && (
                  <motion.span
                    layoutId="account-rail"
                    className="absolute left-0 top-0 h-full w-[3px] bg-[color:var(--accent-gold)]"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                {t.label}
              </Link>
            );
          })}
          <hr className="hairline-gold my-3" />
          <button
            onClick={signOut}
            className="meta-xs flex items-center gap-2 py-4 pl-4 text-left text-[color:var(--text-tertiary)] hover:text-[color:var(--accent-gold)]"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> SIGN OUT
          </button>
        </nav>
      </div>

      <div className="-mx-6 flex gap-1 overflow-x-auto border-b border-[color:var(--border-subtle)] px-6 md:hidden">
        {TABS.map((t) => {
          const active = t.exact ? path === t.to : path.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to as any}
              className="meta-xs shrink-0 px-3 py-4"
              style={{
                color: active ? "var(--accent-gold)" : "var(--text-tertiary)",
                borderBottom: active ? "2px solid var(--accent-gold)" : "2px solid transparent",
              }}
            >
              {t.label}
            </Link>
          );
        })}
        <button onClick={signOut} className="meta-xs shrink-0 px-3 py-4 text-[color:var(--text-tertiary)]">
          SIGN OUT
        </button>
      </div>
    </aside>
  );
}
