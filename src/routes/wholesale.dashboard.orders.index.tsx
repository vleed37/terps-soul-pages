import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyWholesaleOrders } from "@/lib/wholesale.functions";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { GoldButton } from "@/components/brand/GoldButton";

export const Route = createFileRoute("/wholesale/dashboard/orders/")({
  head: () => ({ meta: [{ title: "Terps — Wholesale Orders" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const fetchOrders = useServerFn(listMyWholesaleOrders);
  const { data, isLoading } = useQuery({ queryKey: ["wholesale-orders"], queryFn: () => fetchOrders() });

  if (isLoading) return <div className="py-16 text-center text-[color:var(--text-tertiary)]">Loading orders…</div>;
  const orders = data ?? [];

  return (
    <div>
      <div className="mb-8">
        <MetaLabel gold>Orders</MetaLabel>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">All wholesale orders.</h2>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-12 text-center">
          <p className="text-sm text-[color:var(--text-tertiary)]">No orders yet.</p>
          <div className="mt-6">
            <Link to="/wholesale/dashboard/catalog" className="ghost-link">Browse Catalog →</Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[8px] border border-[color:var(--border-luxe)]">
          <table className="min-w-full divide-y divide-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]">
            <thead className="bg-[color:var(--bg-elevated)]">
              <tr>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Boxes</Th>
                <Th>Total</Th>
                <Th>Payment</Th>
                <Th>Fulfillment</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {orders.map((o) => (
                <tr key={o.id}>
                  <Td>
                    <Link to="/wholesale/dashboard/orders/$id" params={{ id: o.id }} className="font-display hover:text-[color:var(--accent-gold)]">
                      {o.order_number}
                    </Link>
                  </Td>
                  <Td>{new Date(o.created_at).toLocaleDateString("en-ZA")}</Td>
                  <Td>{o.total_boxes}</Td>
                  <Td>R{Number(o.total_zar).toFixed(0)}</Td>
                  <Td><Pill text={o.payment_status} accent={o.payment_status === "paid"} /></Td>
                  <Td><Pill text={o.fulfillment_status} /></Td>
                  <Td>
                    <Link to="/wholesale/dashboard/orders/$id" params={{ id: o.id }} className="ghost-link text-xs">View →</Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-left meta-xs text-[color:var(--text-tertiary)]">{children}</th>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-[color:var(--text-primary)]">{children}</td>;
}
function Pill({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
      accent ? "bg-[color:var(--accent-gold-muted)] text-[color:var(--accent-gold)]" : "border border-[color:var(--border-luxe)] text-[color:var(--text-tertiary)]"
    }`}>{text}</span>
  );
}