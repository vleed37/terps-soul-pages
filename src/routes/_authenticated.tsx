import { createFileRoute, redirect, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { getMyCustomer } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated")({
  // Session lives in browser storage, so the server can never read it: render
  // this subtree on the client only and gate it there.
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/account/login", search: { redirect: location.pathname } });
    }
  },
  component: AccountLayout,
});

function AccountLayout() {
  const { user } = useAuth();
  const fetchCustomer = useServerFn(getMyCustomer);
  const { data: customer } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchCustomer(),
    // Without a restored session there is no bearer token to attach yet.
    enabled: !!user,
  });

  const first = customer?.full_name?.split(" ")[0];
  const path = useRouterState({ select: (s) => s.location.pathname });


  return (
    <section className="mx-auto max-w-[1400px] px-6 py-12 md:px-8 md:py-20">
      <div className="md:flex md:gap-16">
        <AccountSidebar firstName={first} />
        <div className="mt-8 flex-1 md:mt-0" key={path}>
          <Outlet />
        </div>
      </div>
    </section>
  );
}
