import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyWholesaleOrder } from "@/lib/wholesale.functions";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";

export const Route = createFileRoute("/wholesale/dashboard/orders/$id")({
  head: () => ({ meta: [{ title: "Terps — Order Detail" }] }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getMyWholesaleOrder);
  const { data, isLoading } = useQuery({
    queryKey: ["wholesale-order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  if (isLoading) return <div className="py-16 text-center text-[color:var(--text-tertiary)]">Loading order…</div>;
  if (!data) {
    return (
      <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-12 text-center">
        <p className="font-display text-2xl">Order not found.</p>
        <Link to="/wholesale/dashboard/orders" className="ghost-link mt-4 inline-block">← Back to orders</Link>
      </div>
    );
  }
  const o = data;
  const addr = o.shipping_address as {
    line1: string; line2?: string | null;
    city: string; province: string;
    postal_code?: string | null; country: string;
  } | null;

  return (
    <div className="space-y-10">
      <div>
        <Link to="/wholesale/dashboard/orders" className="ghost-link">← All orders</Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <MetaLabel gold>Order</MetaLabel>
            <h2 className="mt-3 font-display text-3xl">{o.order_number}</h2>
            <p className="mt-1 text-sm text-[color:var(--text-tertiary)]">{new Date(o.created_at).toLocaleString("en-ZA")}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Pill text={`Payment: ${o.payment_status}`} accent={o.payment_status === "paid"} />
            <Pill text={`Fulfillment: ${o.fulfillment_status}`} />
          </div>
        </div>
      </div>

      <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
        <MetaLabel gold>Line items</MetaLabel>
        <Hairline className="mt-3 mb-6" />
        <ul className="divide-y divide-[color:var(--border-subtle)]">
          {(o.items ?? []).map((it) => (
            <li key={it.id} className="flex justify-between gap-4 py-4">
              <div>
                <p className="font-display text-lg">{it.strain_name}</p>
                <p className="meta-xs text-[color:var(--text-tertiary)]">
                  {it.boxes_ordered} × box of {it.box_quantity_per_unit} units · R{Number(it.box_price_zar).toFixed(0)}/box
                </p>
              </div>
              <p className="font-display text-lg whitespace-nowrap">R{Number(it.line_total_zar).toFixed(0)}</p>
            </li>
          ))}
        </ul>
        <Hairline className="my-6" />
        <div className="ml-auto max-w-xs space-y-1.5 text-sm">
          <Row label="Subtotal" value={`R${Number(o.subtotal_zar).toFixed(0)}`} />
          <Row label="Shipping" value={`R${Number(o.shipping_zar).toFixed(0)}`} />
          <Row label="VAT" value={`R${Number(o.vat_zar).toFixed(0)}`} />
          <div className="flex justify-between border-t border-[color:var(--border-subtle)] pt-3 mt-3 text-base">
            <span className="font-display">Total</span>
            <span className="font-display">R{Number(o.total_zar).toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-6">
          <MetaLabel gold>Shipping</MetaLabel>
          {addr ? (
            <p className="mt-3 text-sm text-[color:var(--text-secondary)] leading-relaxed">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br/>
              {addr.city}, {addr.province}{addr.postal_code ? ` ${addr.postal_code}` : ""}<br/>
              {addr.country}
            </p>
          ) : <p className="mt-3 text-sm text-[color:var(--text-tertiary)]">—</p>}
          {o.tracking_number && (
            <p className="mt-4 text-sm">
              <span className="meta-xs text-[color:var(--text-tertiary)]">TRACKING</span><br/>
              {o.tracking_number}
            </p>
          )}
        </div>
        <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-6">
          <MetaLabel gold>Payment</MetaLabel>
          <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
            BobPay · {o.payment_status}
            {o.paid_at && <><br/>Paid {new Date(o.paid_at).toLocaleString("en-ZA")}</>}
          </p>
          {o.bobpay_transaction_id && (
            <p className="mt-2 meta-xs text-[color:var(--text-tertiary)]">TX {o.bobpay_transaction_id}</p>
          )}
        </div>
      </div>

      {o.customer_notes && (
        <div className="rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] p-6">
          <MetaLabel gold>Your notes</MetaLabel>
          <p className="mt-3 text-sm text-[color:var(--text-secondary)]">{o.customer_notes}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[color:var(--text-secondary)]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Pill({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
      accent ? "bg-[color:var(--accent-gold-muted)] text-[color:var(--accent-gold)]" : "border border-[color:var(--border-luxe)] text-[color:var(--text-tertiary)]"
    }`}>{text}</span>
  );
}