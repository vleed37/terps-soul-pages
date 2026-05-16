import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { getMyCustomer, getMyOrders } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Terps — Account" }] }),
  component: OverviewPage,
});

function OverviewPage() {
  const fetchCustomer = useServerFn(getMyCustomer);
  const fetchOrders = useServerFn(getMyOrders);
  const { data: customer } = useQuery({ queryKey: ["me"], queryFn: () => fetchCustomer() });
  const { data: orders } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetchOrders() });
  const first = customer?.full_name?.split(" ")[0] ?? "friend";
  const latest = orders?.[0];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <MetaLabel gold>ACCOUNT</MetaLabel>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Welcome back, {first}.</h1>
      <p className="mt-3 text-[color:var(--text-secondary)]">
        {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-12 rounded-[12px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
        <MetaLabel gold>MOST RECENT ORDER</MetaLabel>
        <Hairline className="my-4" />
        {latest ? (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-2xl">#{latest.order_number}</p>
              <p className="meta-xs mt-1 text-[color:var(--text-tertiary)]">
                {new Date(latest.created_at!).toLocaleDateString()} · {latest.items.length} item{latest.items.length === 1 ? "" : "s"} · R{Number(latest.total).toFixed(0)}
              </p>
            </div>
            <Link to="/account/orders" className="font-display italic text-sm text-[color:var(--accent-gold)] hover:underline">
              VIEW ALL ORDERS →
            </Link>
          </div>
        ) : (
          <div>
            <p className="font-display italic text-xl">Your story starts here.</p>
            <Link to="/shop" className="mt-4 inline-block font-display italic text-sm text-[color:var(--accent-gold)] hover:underline">
              EXPLORE THE COLLECTION →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
