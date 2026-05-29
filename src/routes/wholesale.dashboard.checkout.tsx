import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  useWholesaleCart,
  wholesaleCartSelectors,
  WHOLESALE_SHIPPING,
  WHOLESALE_VAT_RATE,
} from "@/lib/store/wholesale-cart";
import { getMyWholesaleAccount, createWholesaleOrder } from "@/lib/wholesale.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";

export const Route = createFileRoute("/wholesale/dashboard/checkout")({
  head: () => ({ meta: [{ title: "Terps — Wholesale Checkout" }] }),
  component: WholesaleCheckoutPage,
});

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Mpumalanga", "Limpopo", "North West", "Northern Cape",
] as const;

function WholesaleCheckoutPage() {
  const items = useWholesaleCart((s) => s.items);
  const subtotal = useWholesaleCart(wholesaleCartSelectors.subtotal);
  const hydrated = useWholesaleCart((s) => s.hydrated);
  const clearCart = useWholesaleCart((s) => s.clear);
  const navigate = useNavigate();

  const getAccount = useServerFn(getMyWholesaleAccount);
  const placeOrder = useServerFn(createWholesaleOrder);
  const acctQ = useQuery({ queryKey: ["wholesale-account"], queryFn: () => getAccount() });

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("Gauteng");
  const [postal, setPostal] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!acctQ.data) return;
    setLine1((v) => v || acctQ.data?.business_address_line_1 || "");
    setLine2((v) => v || acctQ.data?.business_address_line_2 || "");
    setCity((v) => v || acctQ.data?.business_city || "");
    setProvince((v) => v || acctQ.data?.business_province || "Gauteng");
    setPostal((v) => v || acctQ.data?.business_postal_code || "");
  }, [acctQ.data]);

  useEffect(() => {
    if (hydrated && items.length === 0) navigate({ to: "/wholesale/dashboard/catalog" });
  }, [hydrated, items.length, navigate]);

  if (!hydrated || acctQ.isLoading) {
    return <div className="py-16 text-center text-[color:var(--text-tertiary)]">Loading…</div>;
  }

  const vat = (subtotal + WHOLESALE_SHIPPING) * WHOLESALE_VAT_RATE;
  const total = subtotal + WHOLESALE_SHIPPING + vat;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await placeOrder({
        data: {
          items: items.map((i) => ({ strainId: i.strainId, boxes: i.boxes })),
          shipping_address: {
            line1, line2: line2 || null,
            city, province,
            postal_code: postal || null,
            country: "South Africa",
          },
          customer_notes: notes || null,
        },
      });
      if (!res.ok) {
        toast.error(res.error);
        if (res.orderNumber) {
          // Order created but payment failed/unavailable — still record + send to detail
          clearCart();
          if ("orderId" in res && res.orderId) {
            navigate({ to: "/wholesale/dashboard/orders/$id", params: { id: res.orderId } });
          }
        }
        return;
      }
      clearCart();
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        navigate({ to: "/wholesale/dashboard/orders/$id", params: { id: res.orderId } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="space-y-10">
        <div>
          <MetaLabel gold>Shipping address</MetaLabel>
          <Hairline className="mt-3 mb-6" />
          <div className="space-y-5">
            <Field label="Address line 1 *">
              <input required value={line1} onChange={(e) => setLine1(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Address line 2">
              <input value={line2} onChange={(e) => setLine2(e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="City *">
                <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Province *">
                <select required value={province} onChange={(e) => setProvince(e.target.value)} className={inputCls}>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Postal code">
              <input value={postal} onChange={(e) => setPostal(e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>

        <div>
          <MetaLabel gold>Notes</MetaLabel>
          <Hairline className="mt-3 mb-6" />
          <Field label="Anything we should know? (optional)">
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div>
          <MetaLabel gold>Payment</MetaLabel>
          <Hairline className="mt-3 mb-6" />
          <div className="rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-6">
            <p className="meta-xs text-[color:var(--accent-gold)]">BobPay · Secure Checkout</p>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
              You'll be redirected to BobPay to complete payment. EFT, instant payment, and card supported. South African Rand (ZAR).
            </p>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
          <MetaLabel gold>Your Order</MetaLabel>
          <ul className="mt-6 space-y-3">
            {items.map((i) => (
              <li key={i.strainId} className="flex justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="font-display text-base leading-tight">{i.name}</p>
                  <p className="meta-xs text-[color:var(--text-tertiary)]">
                    {i.boxes} × box ({i.boxQuantity} units)
                  </p>
                </div>
                <span className="font-semibold whitespace-nowrap">R{(i.boxPriceZar * i.boxes).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <Hairline className="my-6" />
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={`R${subtotal.toFixed(0)}`} />
            <Row label="Shipping" value={`R${WHOLESALE_SHIPPING.toFixed(0)}`} />
            <Row label="VAT (15%)" value={`R${vat.toFixed(0)}`} />
          </div>
          <Hairline className="my-6" />
          <div className="flex items-baseline justify-between">
            <span className="font-display text-xl">Total</span>
            <span className="font-body text-2xl font-semibold">R{total.toFixed(0)}</span>
          </div>
          <GoldButton type="submit" className="mt-8 w-full" disabled={submitting}>
            {submitting ? "Processing…" : "Place Wholesale Order"}
          </GoldButton>
          <p className="mt-4 text-center meta-xs text-[color:var(--text-tertiary)]">
            <Link to="/wholesale/dashboard/catalog" className="hover:text-[color:var(--accent-gold)]">← Continue shopping</Link>
          </p>
        </div>
      </aside>
    </form>
  );
}

const inputCls =
  "w-full rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-base)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--accent-gold)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="meta-xs mb-2 block text-[color:var(--text-tertiary)]">{label}</span>
      {children}
    </label>
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