import { createFileRoute, Link, Outlet, redirect, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyWholesaleAccount } from "@/lib/wholesale.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { WholesaleCartDrawer } from "@/components/brand/WholesaleCartDrawer";
import { useWholesaleCart, wholesaleCartSelectors } from "@/lib/store/wholesale-cart";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/layout/PageSkeletons";

export const Route = createFileRoute("/wholesale/dashboard")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({
        to: "/wholesale/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: WholesaleDashboardLayout,
  pendingComponent: () => <DashboardSkeleton />,
  pendingMs: 0,
});

const NAV = [
  { to: "/wholesale/dashboard", label: "Dashboard", exact: true },
  { to: "/wholesale/dashboard/catalog", label: "Catalog", exact: false },
  { to: "/wholesale/dashboard/orders", label: "Orders", exact: false },
] as const;

function WholesaleDashboardLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const getAccount = useServerFn(getMyWholesaleAccount);
  const openCart = useWholesaleCart((s) => s.openDrawer);
  const cartCount = useWholesaleCart(wholesaleCartSelectors.boxCount);
  const hydrated = useWholesaleCart((s) => s.hydrated);

  const accountQ = useQuery({
    queryKey: ["wholesale-account"],
    queryFn: () => getAccount(),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/wholesale/login" });
  }

  if (accountQ.isLoading) {
    return <div className="px-6 py-32 text-center text-[color:var(--text-tertiary)]">Loading portal…</div>;
  }

  const acct = accountQ.data;
  if (!acct) {
    return (
      <Gated>
        <h1 className="font-display text-4xl">No application found.</h1>
        <p className="mt-4 text-[color:var(--text-secondary)]">
          You're signed in but haven't applied to become a stockist yet.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <GoldButton onClick={() => navigate({ to: "/wholesale" })}>Apply Now</GoldButton>
          <GoldButton variant="secondary" onClick={signOut}>Sign Out</GoldButton>
        </div>
      </Gated>
    );
  }

  if (acct.approval_status !== "approved") {
    const titleMap: Record<string, string> = {
      pending: "Application under review.",
      rejected: "Application declined.",
      suspended: "Account suspended.",
    };
    const msgMap: Record<string, string> = {
      pending: "We'll be in touch within 48 hours. You'll receive an email once your stockist account is approved.",
      rejected: acct.rejection_reason || "Please contact sales@terpnation.co.za for next steps.",
      suspended: "Your account is temporarily suspended. Contact sales@terpnation.co.za.",
    };
    return (
      <Gated>
        <MetaLabel gold>Stockist Status</MetaLabel>
        <h1 className="mt-4 font-display text-4xl">{titleMap[acct.approval_status]}</h1>
        <p className="mt-4 text-[color:var(--text-secondary)]">{msgMap[acct.approval_status]}</p>
        <p className="mt-6 text-sm text-[color:var(--text-tertiary)]">
          Signed in as <span className="text-[color:var(--text-primary)]">{acct.business_name}</span>
        </p>
        <div className="mt-8">
          <button onClick={signOut} className="ghost-link">Sign out →</button>
        </div>
      </Gated>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-12 md:px-8 md:py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <MetaLabel gold>Stockist Portal</MetaLabel>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">{acct.business_name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCart}
            className="rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] px-4 py-2 text-sm text-[color:var(--text-primary)] hover:border-[color:var(--accent-gold)]"
          >
            Cart {hydrated && cartCount > 0 ? `· ${cartCount} box${cartCount > 1 ? "es" : ""}` : ""}
          </button>
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <nav className="mt-8 flex gap-2 overflow-x-auto border-b border-[color:var(--border-subtle)]">
        {NAV.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "border-b-2 px-4 py-3 meta-xs transition-colors",
                active
                  ? "border-[color:var(--accent-gold)] text-[color:var(--accent-gold)]"
                  : "border-transparent text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10" key={path}>
        <Outlet />
      </div>

      <WholesaleCartDrawer />
    </section>
  );
}

function Gated({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center">
      <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-12">
        {children}
      </div>
    </section>
  );
}