import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart, cartSelectors, computeTotals } from "@/lib/store/cart";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { initiateBobpayPayment } from "@/lib/checkout.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Terps — Checkout" }] }),
  component: CheckoutPage,
});

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Mpumalanga",
  "Limpopo",
  "North West",
  "Northern Cape",
] as const;

const FormSchema = z
  .object({
    fullName: z.string().min(2, "Required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(6, "Required"),
    deliveryMethod: z.enum(["delivery", "collect"]),
    line1: z.string().optional(),
    line2: z.string().optional(),
    suburb: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    notes: z.string().max(1000).optional(),
    acceptTerms: z.literal(true, { message: "Please accept the terms" } as never),
    confirmAge: z.literal(true, { message: "You must confirm you're 18+" } as never),
  })
  .superRefine((v, ctx) => {
    if (v.deliveryMethod === "delivery") {
      const req = ["line1", "suburb", "city", "province", "postalCode"] as const;
      for (const k of req) {
        if (!v[k] || String(v[k]).trim() === "") {
          ctx.addIssue({ path: [k], code: "custom", message: "Required" });
        }
      }
    }
  });

type FormVals = z.infer<typeof FormSchema>;

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSelectors.subtotal);
  const hydrated = useCart((s) => s.hydrated);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormVals>({
    resolver: zodResolver(FormSchema),
    defaultValues: { deliveryMethod: "delivery" },
  });

  const method = watch("deliveryMethod");
  const totals = computeTotals(subtotal, method);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      navigate({ to: "/shop" });
    }
  }, [hydrated, items.length, navigate]);

  const onSubmit = async (values: FormVals) => {
    setSubmitting(true);
    try {
      const res = await initiateBobpayPayment({
        data: {
          items: items.map((i) => ({
            strainId: i.strainId,
            slug: i.slug,
            name: i.name,
            priceZar: i.priceZar,
            weightGrams: i.weightGrams,
            quantity: i.quantity,
          })),
          contact: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
          },
          deliveryMethod: values.deliveryMethod,
          address:
            values.deliveryMethod === "delivery"
              ? {
                  line1: values.line1!,
                  line2: values.line2 || null,
                  suburb: values.suburb!,
                  city: values.city!,
                  province: values.province!,
                  postalCode: values.postalCode!,
                }
              : null,
          collectStockistId: null,
          notes: values.notes || null,
        },
      });

      if (res.ok) {
        clear();
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl;
        } else {
          navigate({ to: "/order/$orderNumber", params: { orderNumber: res.orderNumber } });
        }
      } else {
        toast.error(res.error || "Checkout failed");
        if (res.orderNumber) {
          navigate({ to: "/order/$orderNumber", params: { orderNumber: res.orderNumber } });
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return <div className="px-6 py-32 text-center text-[color:var(--text-tertiary)]">Loading…</div>;
  }

  return (
    <section className="px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <Link to="/shop" className="ghost-link">← Continue browsing</Link>
        <div className="mt-6">
          <MetaLabel gold>Checkout</MetaLabel>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">Complete your order.</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
        >
          {/* LEFT — form */}
          <div className="space-y-12">
            <Section title="Contact">
              <Field label="Full Name" error={errors.fullName?.message}>
                <input className={inputCls} {...register("fullName")} />
              </Field>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Email" error={errors.email?.message}>
                  <input type="email" className={inputCls} {...register("email")} />
                </Field>
                <Field label="Phone" error={errors.phone?.message}>
                  <input className={inputCls} {...register("phone")} />
                </Field>
              </div>
            </Section>

            <Section title="Delivery">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <MethodRadio
                  value="delivery"
                  current={method}
                  register={register("deliveryMethod")}
                  label="Courier Delivery"
                  hint="2–4 business days · Free over R500"
                />
                <MethodRadio
                  value="collect"
                  current={method}
                  register={register("deliveryMethod")}
                  label="Collect from Stockist"
                  hint="Free · We'll confirm by email"
                />
              </div>

              {method === "delivery" && (
                <div className="mt-6 space-y-6">
                  <Field label="Street Address" error={errors.line1?.message}>
                    <input className={inputCls} {...register("line1")} />
                  </Field>
                  <Field label="Apartment, suite, etc. (optional)">
                    <input className={inputCls} {...register("line2")} />
                  </Field>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label="Suburb" error={errors.suburb?.message}>
                      <input className={inputCls} {...register("suburb")} />
                    </Field>
                    <Field label="City" error={errors.city?.message}>
                      <input className={inputCls} {...register("city")} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label="Province" error={errors.province?.message}>
                      <select className={inputCls} {...register("province")}>
                        <option value="">Select province</option>
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Postal Code" error={errors.postalCode?.message}>
                      <input className={inputCls} {...register("postalCode")} />
                    </Field>
                  </div>
                </div>
              )}
            </Section>

            <Section title="Notes (optional)">
              <Field label="Anything we should know?">
                <textarea rows={3} className={inputCls} {...register("notes")} />
              </Field>
            </Section>

            <Section title="Payment">
              <div className="rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-6">
                <p className="meta-xs text-gold">BobPay · Secure Checkout</p>
                <p className="mt-3 text-[color:var(--text-secondary)]">
                  You'll be redirected to BobPay to complete payment. EFT, instant payment, and card supported. South African Rand (ZAR).
                </p>
              </div>
            </Section>

            <Section title="Confirm">
              <label className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                <input type="checkbox" className="mt-1 accent-[color:var(--accent-gold)]" {...register("confirmAge")} />
                <span>I confirm I am 18 years or older.</span>
              </label>
              {errors.confirmAge && <p className="text-xs text-red-400">{errors.confirmAge.message as string}</p>}
              <label className="mt-3 flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                <input type="checkbox" className="mt-1 accent-[color:var(--accent-gold)]" {...register("acceptTerms")} />
                <span>I accept the terms of sale and privacy policy.</span>
              </label>
              {errors.acceptTerms && <p className="text-xs text-red-400">{errors.acceptTerms.message as string}</p>}
            </Section>
          </div>

          {/* RIGHT — summary */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
              <MetaLabel gold>Your Order</MetaLabel>
              <ul className="mt-6 space-y-4">
                {items.map((i) => (
                  <li key={i.strainId} className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-lg leading-tight">{i.name}</p>
                      <p className="meta-xs text-[color:var(--text-tertiary)]">
                        Qty {i.quantity} · {i.weightGrams}g
                      </p>
                    </div>
                    <span className="font-body font-semibold whitespace-nowrap">
                      R{(i.priceZar * i.quantity).toFixed(0)}
                    </span>
                  </li>
                ))}
              </ul>
              <Hairline className="my-6" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[color:var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>R{totals.subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[color:var(--text-secondary)]">
                  <span>Delivery</span>
                  <span>{totals.deliveryFee === 0 ? "Free" : `R${totals.deliveryFee}`}</span>
                </div>
              </div>
              <Hairline className="my-6" />
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xl">Total</span>
                <span className="font-body text-2xl font-semibold">R{totals.total.toFixed(0)}</span>
              </div>
              <GoldButton type="submit" disabled={submitting} className="mt-8 w-full">
                {submitting ? "Processing…" : "Place Order"}
              </GoldButton>
              <p className="mt-4 text-center meta-xs text-[color:var(--text-tertiary)]">
                Secured by BobPay · ZAR
              </p>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}

const inputCls =
  "w-full rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-base)] px-4 py-3 text-[color:var(--text-primary)] outline-none transition-colors focus:border-[color:var(--accent-gold)]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <MetaLabel gold>{title}</MetaLabel>
      <Hairline className="mt-3 mb-6" />
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="meta-xs mb-2 block text-[color:var(--text-tertiary)]">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

function MethodRadio({
  value,
  current,
  register,
  label,
  hint,
}: {
  value: "delivery" | "collect";
  current: string;
  register: UseFormRegisterReturn;
  label: string;
  hint: string;
}) {
  const active = current === value;
  return (
    <label
      className={`cursor-pointer rounded-[4px] border p-5 transition-all ${
        active
          ? "border-[color:var(--accent-gold)] bg-[color:var(--accent-gold-muted)]"
          : "border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] hover:border-[color:var(--text-tertiary)]"
      }`}
    >
      <input type="radio" value={value} className="sr-only" {...register} />
      <p className="font-display text-lg">{label}</p>
      <p className="meta-xs mt-1 text-[color:var(--text-tertiary)]">{hint}</p>
    </label>
  );
}