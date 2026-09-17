import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { adminWhoAmI } from "@/lib/admin-ops.functions";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  // Session lives in browser storage, so gate on the client. Authorisation is
  // decided server-side: adminWhoAmI checks public.user_roles via has_role().
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/account/login", search: { redirect: location.pathname } });
    }
    const me = await adminWhoAmI();
    if (!me.isAdmin) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Terps — Internal Management" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/strains", label: "Products", exact: false },
  { to: "/admin/orders", label: "Orders", exact: false },
  { to: "/admin/reviews", label: "Reviews", exact: false },
  { to: "/admin/stockists", label: "Stockists", exact: false },
  { to: "/admin/terpenes", label: "Terpenes", exact: false },
  { to: "/admin/settings", label: "Settings", exact: false },
  { to: "/admin/readiness", label: "Readiness", exact: false },
] as const;

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)] px-5 py-10 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--border-subtle)] pb-6">
          <div>
            <MetaLabel gold>Internal</MetaLabel>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">Terps management.</h1>
          </div>
          <Link to="/" className="ghost-link text-xs">
            ← Back to site
          </Link>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "border-[color:var(--accent-gold)] text-[color:var(--accent-gold)]"
                    : "border-[color:var(--border-strong)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <main className="mt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
