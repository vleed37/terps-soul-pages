import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { GoldButton } from "@/components/brand/GoldButton";
import { submitWholesaleInquiry } from "@/lib/forms.functions";
import stockistDisplay from "@/assets/stockist-display.jpg";

export const Route = createFileRoute("/wholesale")({
  head: () => ({
    meta: [
      { title: "Become a Stockist — Terps" },
      { name: "description", content: "Premium pre-rolls and exclusive Caviar Stix access for curated South African retailers. Apply to stock Terps." },
      { property: "og:title", content: "Become a Stockist — Terps" },
      { property: "og:description", content: "Premium pre-rolls and exclusive Caviar Stix access for curated retailers." },
      { property: "og:image", content: stockistDisplay },
    ],
  }),
  component: WholesalePage,
});

function WholesalePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={stockistDisplay} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--bg-rich)]/70 via-[color:var(--bg-rich)]/85 to-[color:var(--bg-base)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-32 text-center md:py-44">
          <MetaLabel gold>✦ Stockist Program</MetaLabel>
          <h1 className="mx-auto mt-6 font-display text-5xl leading-[1.05] md:text-7xl lg:text-[5.5rem]">
            Become a Terps stockist.
          </h1>
          <p className="mx-auto mt-8 max-w-xl font-display text-2xl italic text-[color:var(--text-secondary)] md:text-3xl">
            Premium pre-rolls and exclusive Caviar Stix access for curated retailers.
          </p>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>What you get</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">
              Built for serious retailers.
            </h2>
          </ScrollReveal>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                t: "Wholesale Pricing",
                d: "Competitive margins across the full collection — Infused Pre-Rolls and Caviar Stix.",
              },
              {
                t: "Early Access",
                d: "Caviar Stix drops before public release. First look at exclusive batches and limited runs.",
              },
              {
                t: "Brand Support",
                d: "Marketing materials, in-store displays, and product training for your team.",
              },
            ].map((c, i) => (
              <ScrollReveal
                key={c.t}
                delay={i * 0.1}
                className="rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-10"
              >
                <div className="h-px w-12 bg-[color:var(--accent-gold)]" />
                <h3 className="mt-6 font-display text-2xl">{c.t}</h3>
                <p className="mt-4 font-body text-base leading-relaxed text-[color:var(--text-secondary)]">
                  {c.d}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[color:var(--bg-surface)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>How it works</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">
              Three steps. <em className="text-[color:var(--accent-gold)]">No friction.</em>
            </h2>
          </ScrollReveal>
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              { n: "01", t: "Apply", d: "Tell us about your store." },
              { n: "02", t: "Approve", d: "Quick review, usually within 48 hours." },
              { n: "03", t: "Stock", d: "Get your first order placed and start moving Terps." },
            ].map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 0.1} className="text-center">
                <p className="font-display text-5xl italic text-[color:var(--accent-gold)]">
                  {step.n}
                </p>
                <h3 className="mt-4 font-display text-2xl">{step.t}</h3>
                <p className="mt-3 font-body text-base text-[color:var(--text-secondary)]">
                  {step.d}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* INQUIRY FORM */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[760px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>Application</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">Tell us about your store.</h2>
          </ScrollReveal>
          <div className="mt-16">
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* ALREADY A STOCKIST */}
      <section className="border-t border-[color:var(--border-subtle)] px-6 py-20">
        <div className="mx-auto max-w-[760px] text-center">
          <Hairline w="60px" className="mx-auto" />
          <p className="mt-8 font-display text-2xl italic text-[color:var(--text-secondary)] md:text-3xl">
            Already stocking Terps?
          </p>
          <p className="mt-3 text-[color:var(--text-secondary)]">
            Sign in to access your wholesale dashboard.
          </p>
          <div className="mt-8 inline-flex items-center gap-3">
            <button
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[color:var(--border-strong)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-tertiary)]"
            >
              Stockist Portal
            </button>
            <span className="rounded-full border border-[color:var(--accent-gold)] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-gold)]">
              Coming soon
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

const BUSINESS_TYPES = ["Dispensary", "Lounge", "Specialty Retailer", "Other"];
const VOLUMES = ["Under 50 units", "50–200", "200–500", "500+"];

function InquiryForm() {
  const [state, setState] = useState({
    full_name: "",
    business_name: "",
    email: "",
    phone: "",
    location: "",
    business_type: "",
    volume: "",
    message: "",
  });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setState((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await submitWholesaleInquiry({ data: state });
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-12 text-center">
        <p className="font-display text-3xl italic text-[color:var(--accent-gold)] md:text-4xl">
          We'll be in touch within 48 hours.
        </p>
        <p className="mt-6 text-[color:var(--text-secondary)]">
          In the meantime, <Link to="/shop" className="ghost-link">explore the collection →</Link>
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--accent-gold)]";
  const labelCls = "meta-xs mb-2 block text-[color:var(--text-secondary)]";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelCls}>Full name *</label>
          <input required maxLength={120} value={state.full_name} onChange={update("full_name")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Business / store name *</label>
          <input required maxLength={200} value={state.business_name} onChange={update("business_name")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input required type="email" maxLength={255} value={state.email} onChange={update("email")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone *</label>
          <input required maxLength={30} value={state.phone} onChange={update("phone")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Store location / city *</label>
          <input required maxLength={200} value={state.location} onChange={update("location")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Type of business *</label>
          <select required value={state.business_type} onChange={update("business_type")} className={inputCls}>
            <option value="">Select…</option>
            {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Estimated monthly volume *</label>
          <select required value={state.volume} onChange={update("volume")} className={inputCls}>
            <option value="">Select…</option>
            {VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Message (optional)</label>
          <textarea maxLength={2000} rows={5} value={state.message} onChange={update("message")} className={inputCls} />
        </div>
      </div>
      {err && <p className="text-sm text-[color:var(--status-error)]">{err}</p>}
      <div className="pt-2">
        <GoldButton type="submit" disabled={submitting} className="w-full md:w-auto">
          {submitting ? "Submitting…" : "Submit Application"}
        </GoldButton>
      </div>
    </form>
  );
}