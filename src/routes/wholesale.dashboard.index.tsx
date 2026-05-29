import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyWholesaleAccount, listMyWholesaleOrders } from "@/lib/wholesale.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";

export const Route = createFileRoute("/wholesale/dashboard/")({
  head: () => ({ meta: [{ title: "Terps — Stockist Dashboard" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const getAccount = useServerFn(getMyWholesaleAccount);
  const listOrders = useServerFn(listMyWholesaleOrders);
  const accountQ = useQuery({ queryKey: ["wholesale-account"], queryFn: () => getAccount() });
  const ordersQ = useQuery({ queryKey: ["wholesale-orders"], queryFn: () => listOrders() });

  const acct = accountQ.data;
  const orders = ordersQ.data ?? [];
  const lastOrder = orders[0];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Orders Placed" value={orders.length.toString()} />
        <StatCard
          label="Last Order"
          value={lastOrder ? new Date(lastOrder.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }) : "—"}
        />
        <StatCard
          label="Active Since"
          value={acct?.approved_at ? new Date(acct.approved_at).toLocaleDateString("en-ZA", { month: "short", year: "numeric" }) : "—"}
        />
        <StatCard label="Status" value={acct?.approval_status ?? "—"} accent />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link to="/wholesale/dashboard/catalog" className="block rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8 transition-colors hover:border-[color:var(--accent-gold)]">
          <MetaLabel gold>Browse</MetaLabel>
          <h3 className="mt-3 font-display text-2xl">Catalog</h3>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Box pricing on the full collection. Add to order in one tap.</p>
        </Link>
        <Link to="/wholesale/dashboard/orders" className="block rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8 transition-colors hover:border-[color:var(--accent-gold)]">
          <MetaLabel gold>History</MetaLabel>
          <h3 className="mt-3 font-display text-2xl">My Orders</h3>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">View past wholesale orders, payment, and fulfillment status.</p>
        </Link>
      </div>

      <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
        <div className="flex items-end justify-between">
          <div>
            <MetaLabel gold>Recent Orders</MetaLabel>
            <h3 className="mt-3 font-display text-2xl">Last 5</h3>
          </div>
          <Link to="/wholesale/dashboard/orders" className="ghost-link">View all →</Link>
        </div>
        <Hairline className="my-6" />
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-[color:var(--text-tertiary)]">
            No orders yet. <Link to="/wholesale/dashboard/catalog" className="ghost-link">Browse the catalog →</Link>
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--border-subtle)]">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-4">
                <div>
                  <Link to="/wholesale/dashboard/orders/$id" params={{ id: o.id }} className="font-display text-lg hover:text-[color:var(--accent-gold)]">
                    {o.order_number}
                  </Link>
                  <p className="meta-xs text-[color:var(--text-tertiary)]">
                    {new Date(o.created_at).toLocaleDateString("en-ZA")} · {o.total_boxes} boxes
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg">R{Number(o.total_zar).toFixed(0)}</p>
                  <StatusPill payment={o.payment_status} fulfillment={o.fulfillment_status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] p-8 text-center">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Need help? Email <a className="ghost-link" href="mailto:sales@terpsnation.co.za">sales@terpsnation.co.za</a> or WhatsApp +27 ··· ····.
        </p>
      </div>

      <div className="hidden md:block">
        <GoldButton variant="secondary" className="opacity-0 pointer-events-none">spacer</GoldButton>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-5">
      <p className="meta-xs text-[color:var(--text-tertiary)]">{label}</p>
      <p className={`mt-2 font-display text-2xl capitalize ${accent ? "text-[color:var(--accent-gold)]" : ""}`}>{value}</p>
    </div>
  );
}

function StatusPill({ payment, fulfillment }: { payment: string; fulfillment: string }) {
  const label = payment === "paid" ? fulfillment : payment;
  const isPaid = payment === "paid";
  return (
    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
      isPaid ? "bg-[color:var(--accent-gold-muted)] text-[color:var(--accent-gold)]" : "border border-[color:var(--border-luxe)] text-[color:var(--text-tertiary)]"
    }`}>
      {label}
    </span>
  );
}