import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Clock, Package, Truck } from "lucide-react";
import { getOrderByNumber } from "@/lib/checkout.functions";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";

export const Route = createFileRoute("/order/$orderNumber")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["order", params.orderNumber],
      queryFn: () => getOrderByNumber({ data: { orderNumber: params.orderNumber } }),
    }),
  head: ({ params }) => ({ meta: [{ title: `Terps — Order ${params.orderNumber}` }] }),
  component: OrderPage,
  notFoundComponent: () => (
    <div className="py-40 text-center">
      <p className="font-display italic text-4xl">Order not found.</p>
      <Link to="/shop" className="ghost-link mt-8 inline-block">Return to collection</Link>
    </div>
  ),
  errorComponent: () => <div className="py-40 text-center">Something went wrong.</div>,
});

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const { data: order } = useSuspenseQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => getOrderByNumber({ data: { orderNumber } }),
  });

  if (!order) {
    return (
      <div className="py-40 text-center">
        <p className="font-display italic text-4xl">Order not found.</p>
        <Link to="/shop" className="ghost-link mt-8 inline-block">Return to collection</Link>
      </div>
    );
  }

  const failed = order.payment_status === "failed";
  const pending = order.payment_status === "unpaid";
  const paid = order.payment_status === "paid";
  const addr = order.delivery_address as null | {
    line1: string;
    line2?: string | null;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,168,76,0.18), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[900px] text-center">
          <MetaLabel gold>{failed ? "Payment Failed" : paid ? "Order Confirmed" : "Order Pending"}</MetaLabel>
          <h1 className="mt-6 font-display text-5xl leading-tight md:text-7xl">
            {failed ? "Something went wrong." : paid ? "Thank you." : "Almost there."}
          </h1>
          <p className="mt-6 font-display text-2xl italic text-[color:var(--text-secondary)]">
            {failed
              ? "Your payment couldn't be completed. Please try again or contact us."
              : paid
              ? "Your order has been received."
              : "We're awaiting payment confirmation."}
          </p>
          <p className="meta-xs mt-8 text-gold">{order.order_number}</p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="px-6 pb-16 md:px-12">
        <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-px overflow-hidden rounded-[4px] bg-[color:var(--border-luxe)] md:grid-cols-4">
          <Step icon={Check} label="Placed" active />
          <Step icon={Clock} label="Payment" active={paid || failed} failed={failed} />
          <Step icon={Package} label="Prepared" active={paid} />
          <Step icon={Truck} label="Dispatched" active={false} />
        </div>
      </section>

      {/* SUMMARY */}
      <section className="px-6 pb-32 md:px-12">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 md:grid-cols-2">
          <div className="rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
            <MetaLabel gold>Order Summary</MetaLabel>
            <ul className="mt-6 space-y-4">
              {order.items.map((it) => (
                <li key={it.strain_slug} className="flex justify-between gap-4">
                  <div>
                    <p className="font-display text-lg leading-tight">{it.strain_name}</p>
                    <p className="meta-xs text-[color:var(--text-tertiary)]">Qty {it.quantity}</p>
                  </div>
                  <span className="font-body font-semibold">R{Number(it.line_total).toFixed(0)}</span>
                </li>
              ))}
            </ul>
            <Hairline className="my-6" />
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={`R${Number(order.subtotal).toFixed(0)}`} />
              <Row
                label="Delivery"
                value={Number(order.delivery_fee) === 0 ? "Free" : `R${Number(order.delivery_fee).toFixed(0)}`}
              />
            </div>
            <Hairline className="my-6" />
            <div className="flex items-baseline justify-between">
              <span className="font-display text-xl">Total</span>
              <span className="font-body text-2xl font-semibold">R{Number(order.total).toFixed(0)}</span>
            </div>
          </div>

          <div className="rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
            <MetaLabel gold>{order.delivery_method === "collect" ? "Collection" : "Delivery"}</MetaLabel>
            <div className="mt-6 space-y-2 text-[color:var(--text-secondary)]">
              <p className="font-display text-lg text-[color:var(--text-primary)]">{order.guest_name}</p>
              <p>{order.guest_email}</p>
              <p>{order.guest_phone}</p>
            </div>
            {addr && order.delivery_method === "delivery" && (
              <>
                <Hairline className="my-6" />
                <address className="not-italic text-[color:var(--text-secondary)]">
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>
                    {addr.suburb}, {addr.city}
                  </p>
                  <p>
                    {addr.province} {addr.postalCode}
                  </p>
                </address>
              </>
            )}
            {pending && (
              <p className="meta-xs mt-6 text-gold">
                Payment status will update automatically once BobPay confirms.
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-[1100px] text-center">
          <Link to="/shop" className="ghost-link">Return to the collection →</Link>
        </div>
      </section>
    </>
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

function Step({
  icon: Icon,
  label,
  active,
  failed = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active: boolean;
  failed?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 bg-[color:var(--bg-surface)] p-8">
      <div
        className={`grid h-12 w-12 place-items-center rounded-full border transition-all duration-500 ${
          failed
            ? "border-red-500 text-red-400"
            : active
            ? "border-[color:var(--accent-gold)] bg-[color:var(--accent-gold-muted)] text-[color:var(--accent-gold)]"
            : "border-[color:var(--border-luxe)] text-[color:var(--text-tertiary)]"
        }`}
      >
        <Icon strokeWidth={1.5} className="h-5 w-5" />
      </div>
      <span
        className={`meta-xs ${
          active ? "text-[color:var(--text-primary)]" : "text-[color:var(--text-tertiary)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}