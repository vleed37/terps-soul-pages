import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { GoldButton } from "@/components/brand/GoldButton";
import { getMyOrderDetail } from "@/lib/account.functions";
import { useCart } from "@/lib/store/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/orders/$orderNumber")({
  head: () => ({ meta: [{ title: "Terps — Order" }] }),
  component: OrderDetailPage,
});

const STEPS = ["PAYMENT", "PACKING", "SHIPPED", "DELIVERED"] as const;

function stepIndex(status?: string | null, paymentStatus?: string | null) {
  if (status === "delivered") return 3;
  if (status === "shipped") return 2;
  if (paymentStatus === "paid") return 1;
  return 0;
}

function OrderDetailPage() {
  const { orderNumber } = Route.useParams();
  const fetchDetail = useServerFn(getMyOrderDetail);
  const addItem = useCart((s) => s.addItem);
  const { data: order, isLoading } = useQuery({
    queryKey: ["my-order", orderNumber],
    queryFn: () => fetchDetail({ data: { orderNumber } }),
  });

  if (isLoading) return <p className="text-[color:var(--text-secondary)]">Loading…</p>;
  if (!order) return <p className="text-[color:var(--text-secondary)]">Order not found.</p>;

  const current = stepIndex(order.status, order.payment_status);
  const addr = order.delivery_address as any;

  function reorder() {
    for (const it of order!.items ?? []) {
      addItem({
        strainId: it.strain_id!,
        slug: it.strain_slug,
        name: it.strain_name,
        priceZar: Number(it.unit_price),
        weightGrams: 0.75,
        maxStock: 99,
      }, it.quantity);
    }
    toast.success("Added to cart.");
  }

  return (
    <div>
      <Link to="/account/orders" className="font-display italic text-sm text-[color:var(--text-tertiary)] hover:text-[color:var(--accent-gold)]">
        ← BACK TO ORDERS
      </Link>
      <MetaLabel gold className="mt-6 block">ORDER #{order.order_number}</MetaLabel>
      <h1 className="mt-3 font-display text-4xl md:text-5xl capitalize">{order.status}</h1>
      <p className="mt-2 text-[color:var(--text-secondary)]">
        Placed {new Date(order.created_at!).toLocaleString()}
      </p>

      {/* Timeline */}
      <div className="mt-10 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className="h-2 flex-1 rounded-full"
              style={{
                background:
                  i <= current ? "var(--accent-gold)" : "var(--border-luxe)",
              }}
            />
            <span className="meta-xs hidden md:inline" style={{ color: i <= current ? "var(--accent-gold)" : "var(--text-tertiary)" }}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="mt-12">
        <MetaLabel gold>WHAT YOU ORDERED</MetaLabel>
        <Hairline className="my-4" />
        <ul className="divide-y divide-[color:var(--border-subtle)]">
          {order.items.map((it: any) => (
            <li key={it.strain_slug} className="flex items-center justify-between gap-6 py-5">
              <div>
                <p className="font-display text-xl">{it.strain_name}</p>
                <p className="meta-xs text-[color:var(--text-tertiary)]">Qty {it.quantity} · R{Number(it.unit_price).toFixed(0)}</p>
              </div>
              <span className="font-body font-semibold">R{Number(it.line_total).toFixed(0)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Delivery */}
      <div className="mt-12 rounded-[12px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
        <MetaLabel gold>DELIVERY</MetaLabel>
        <Hairline className="my-4" />
        <p className="capitalize text-[color:var(--text-primary)]">{order.delivery_method}</p>
        {addr && (
          <p className="mt-2 text-[color:var(--text-secondary)]">
            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.suburb}, {addr.city}, {addr.province} {addr.postalCode}
          </p>
        )}
        {order.tracking_url && (
          <a href={order.tracking_url} target="_blank" rel="noreferrer" className="mt-4 inline-block">
            <GoldButton type="button">Track Your Package</GoldButton>
          </a>
        )}
      </div>

      {/* Payment */}
      <div className="mt-8 rounded-[12px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
        <MetaLabel gold>PAYMENT</MetaLabel>
        <Hairline className="my-4" />
        <p className="text-[color:var(--text-secondary)]">
          BobPay · <span className="capitalize">{order.payment_status}</span>
          {order.payment_completed_at && ` · ${new Date(order.payment_completed_at).toLocaleString()}`}
        </p>
        <div className="mt-4 space-y-1 text-sm text-[color:var(--text-secondary)]">
          <div className="flex justify-between"><span>Subtotal</span><span>R{Number(order.subtotal).toFixed(0)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>R{Number(order.delivery_fee).toFixed(0)}</span></div>
          <Hairline className="my-2" />
          <div className="flex justify-between text-[color:var(--text-primary)]"><span className="font-display text-lg">Total</span><span className="font-display text-lg">R{Number(order.total).toFixed(0)}</span></div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <GoldButton onClick={reorder}>Reorder These Items</GoldButton>
        <GoldButton variant="tertiary" disabled>Download Invoice · Coming Soon</GoldButton>
      </div>
    </div>
  );
}
