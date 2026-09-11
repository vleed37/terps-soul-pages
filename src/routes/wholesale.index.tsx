import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { GoldButton } from "@/components/brand/GoldButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createWholesaleAccount, getMyWholesaleAccount } from "@/lib/wholesale.functions";
import { motion, useReducedMotion } from "framer-motion";
import wholesaleHero from "@/assets/shoot/wholesale-hero-display.jpg.asset.json";
import { seoMeta } from "@/lib/seo";
import { SALES_EMAIL } from "@/lib/brand";

export const Route = createFileRoute("/wholesale/")({
  head: () => ({
    meta: seoMeta({
      title: "Become a Terps Stockist · Terps",
      description:
        "Stock Terps at your dispensary or lounge. Sign up in minutes for wholesale box pricing, early access to drops and brand support.",
      path: "/wholesale",
    }),
  }),
  component: WholesalePage,
});

function WholesalePage() {
  return (
    <>
      <WholesaleHero />

      {/* WHAT YOU GET */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="max-w-2xl">
            <MetaLabel gold>✦ What you get</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">Built for serious retailers.</h2>
          </ScrollReveal>
          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--border-luxe)] sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((c, i) => (
              <ScrollReveal
                key={c.t}
                delay={i * 0.08}
                className="group relative bg-[color:var(--bg-base)] p-10 transition-colors duration-500 hover:bg-[color:var(--bg-surface)] md:p-12"
              >
                <span className="font-display text-2xl italic text-[color:var(--accent-gold)]">{c.n}</span>
                <div className="mt-6 h-px w-10 bg-[color:var(--accent-gold)] transition-all duration-500 group-hover:w-16" />
                <h3 className="mt-6 font-display text-[1.6rem] leading-tight">{c.t}</h3>
                <p className="mt-4 font-body text-[0.95rem] leading-relaxed text-[color:var(--text-secondary)]">{c.d}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL STATEMENT */}
      <section className="border-y border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] px-6 py-20 md:py-28">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="font-display text-3xl italic leading-[1.2] md:text-[2.75rem]">
            Built for the people putting Terps on shelves.
          </p>
          <p className="mt-6 font-body text-base text-[color:var(--text-secondary)] md:text-lg">
            Better access. Better support. A direct line to what's coming next.
          </p>
        </ScrollReveal>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <ScrollReveal>
            <MetaLabel gold>✦ How it works</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">Two steps. That's it.</h2>
          </ScrollReveal>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] md:gap-12">
            <Step n="01" t="Sign up" d="Create your stockist account. No lengthy application or approval wait." />
            <div
              aria-hidden
              className="my-10 h-px w-full bg-[color:var(--border-luxe)] md:my-0 md:h-full md:w-px"
            />
            <Step
              n="02"
              t="Shop wholesale"
              d="Sign in, access protected box pricing and place your order."
              delay={0.12}
            />
          </div>
        </div>
      </section>


      {/* REGISTER */}
      <section id="apply" className="scroll-mt-28 bg-[color:var(--bg-surface)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[860px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>✦ Become a Stockist</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">Your details.</h2>
            <p className="mt-4 text-[color:var(--text-secondary)]">
              Create your account and your stockist portal opens immediately.
            </p>
          </ScrollReveal>
          <div className="mt-14">
            <ApplyFlow />
          </div>
        </div>
      </section>
    </>
  );
}

const BENEFITS = [
  { n: "01", t: "Box Pricing", d: "Volume-based box pricing across the full collection." },
  { n: "02", t: "New Product Drops", d: "Get early access to new Terps releases." },
  { n: "03", t: "Marketing Material", d: "Access Terps content created for your socials and store." },
  { n: "04", t: "Customer Routing", d: "Our stockist finder helps nearby customers discover your store." },
] as const;

function Step({ n, t, d, delay = 0 }: { n: string; t: string; d: string; delay?: number }) {
  return (
    <ScrollReveal delay={delay}>
      <p className="font-display text-6xl italic leading-none text-[color:var(--accent-gold)] md:text-7xl">{n}</p>
      <h3 className="mt-6 font-body text-sm font-semibold uppercase tracking-[0.18em]">{t}</h3>
      <p className="mt-4 max-w-sm font-body text-base leading-relaxed text-[color:var(--text-secondary)]">{d}</p>
    </ScrollReveal>
  );
}



function WholesaleHero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative grid grid-cols-1 items-stretch lg:min-h-[86vh] lg:grid-cols-[1.05fr_1fr]">
      {/* Photograph */}
      <div className="relative order-1 h-[58vh] min-h-[340px] overflow-hidden lg:order-2 lg:h-auto">
        <motion.img
          src={wholesaleHero.url}
          alt="Terps Infused Pre-Roll tubes and six-pack cartons in a retail display case"
          className="h-full w-full object-cover object-[62%_38%] sm:object-[58%_40%] lg:object-center"
          initial={reduce ? false : { scale: 1.06 }}
          animate={reduce ? undefined : { scale: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* minimal legibility fade only at the seam */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[color:var(--bg-base)] to-transparent lg:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[color:var(--bg-base)] to-transparent lg:block" />
      </div>

      {/* Copy */}
      <div className="order-2 flex items-center bg-[color:var(--bg-base)] px-6 py-16 sm:px-10 lg:order-1 lg:py-24 lg:pl-[max(2rem,6vw)] lg:pr-16">
        <div className="max-w-xl">
          <MetaLabel gold>✦ Stockist Program</MetaLabel>
          <h1 className="mt-6 font-display text-[3.25rem] leading-[0.95] md:text-7xl lg:text-[6rem]">Stock Terps.</h1>
          <Hairline className="my-8" w="88px" />
          <p className="font-body text-lg leading-relaxed text-[color:var(--text-secondary)] md:text-xl">
            Wholesale access to Terps Infused Pre-Rolls and Caviar Stix, built for retailers across South Africa.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href="#apply" className="inline-flex">
              <GoldButton className="group w-full sm:w-auto">
                Become a Stockist
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </GoldButton>
            </a>
            <Link to="/wholesale/login" search={{ redirect: "/wholesale/dashboard" }} className="inline-flex">
              <GoldButton variant="tertiary" className="w-full sm:w-auto">
                Stockist Sign In
              </GoldButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ============== Application Flow ============== */

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Mpumalanga", "Limpopo", "North West", "Northern Cape",
] as const;

type Step1 = { email: string; password: string };
type Details = {
  business_name: string; trading_as: string; business_type: string;
  vat_number: string; cipc_registration_number: string; estimated_monthly_volume: string;
  primary_contact_name: string; primary_contact_email: string; primary_contact_phone: string;
  business_address_line_1: string; business_address_line_2: string; business_city: string;
  business_province: string; business_postal_code: string;
};

function ApplyFlow() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const apply = useServerFn(createWholesaleAccount);
  const getAccount = useServerFn(getMyWholesaleAccount);

  const [step, setStep] = useState<1 | 2>(user ? 2 : 1);
  const [submitting, setSubmitting] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [s1, setS1] = useState<Step1>({ email: "", password: "" });
  const [d, setD] = useState<Details>({
    business_name: "", trading_as: "", business_type: "dispensary",
    vat_number: "", cipc_registration_number: "", estimated_monthly_volume: "",
    primary_contact_name: "", primary_contact_email: "", primary_contact_phone: "",
    business_address_line_1: "", business_address_line_2: "", business_city: "",
    business_province: "Gauteng", business_postal_code: "",
  });

  // If the visitor is already signed in, skip the account step and prefill their email.
  useEffect(() => {
    if (!user) return;
    setStep((s) => (s === 1 ? 2 : s));
    setD((s) => ({ ...s, primary_contact_email: s.primary_contact_email || user.email || "" }));
    getAccount()
      .then((acct) => {
        if (acct) setExistingStatus(acct.approval_status);
      })
      .catch(() => {});
  }, [user, getAccount]);

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!z.string().email().safeParse(s1.email).success) return toast.error("Valid email required");
    if (s1.password.length < 8) return toast.error("Password must be at least 8 characters");
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: s1.email,
      password: s1.password,
      options: { emailRedirectTo: `${window.location.origin}/wholesale` },
    });
    if (error) {
      setSubmitting(false);
      return toast.error(error.message);
    }
    await supabase.auth.signInWithPassword({ email: s1.email, password: s1.password }).catch(() => {});
    setSubmitting(false);
    setD((s) => ({ ...s, primary_contact_email: s1.email }));
    setStep(2);
  }

  async function handleDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!d.business_name.trim()) return toast.error("Business name is required");
    setSubmitting(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        toast.error("Please sign in to finish setting up your stockist account.");
        setSubmitting(false);
        return;
      }
      const res = await apply({
        data: {
          business_name: d.business_name,
          trading_as: d.trading_as,
          vat_number: d.vat_number,
          cipc_registration_number: d.cipc_registration_number,
          business_type: d.business_type as never,
          estimated_monthly_volume: d.estimated_monthly_volume as never,
          primary_contact_name: d.primary_contact_name,
          primary_contact_email: d.primary_contact_email,
          primary_contact_phone: d.primary_contact_phone,
          business_address_line_1: d.business_address_line_1,
          business_address_line_2: d.business_address_line_2,
          business_city: d.business_city,
          business_province: d.business_province,
          business_postal_code: d.business_postal_code,
          business_country: "South Africa",
        },
      });
      if (!res.ok) {
        toast.error(res.error);
      } else {
        setDone(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create your stockist account");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return <Loading />;

  if (done || existingStatus) {
    const status = existingStatus ?? "approved";
    return (
      <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-12 text-center">
        {status === "approved" ? (
          <>
            <p className="font-display text-3xl italic text-[color:var(--accent-gold)] md:text-4xl">You're all set.</p>
            <p className="mt-4 text-[color:var(--text-secondary)]">Head to your stockist portal to start ordering.</p>
            <div className="mt-8">
              <GoldButton onClick={() => navigate({ to: "/wholesale/dashboard" })}>Go to your stockist portal</GoldButton>
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-3xl italic md:text-4xl">Your account isn't active.</p>
            <p className="mt-4 text-[color:var(--text-secondary)]">Contact <a className="ghost-link" href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a> for next steps.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8 md:p-12">
      <Stepper step={step} />
      <div className="mt-10">
        {step === 1 && <Step1Form values={s1} setValues={setS1} onSubmit={handleStep1} submitting={submitting} />}
        {step === 2 && (
          <DetailsForm
            values={d}
            setValues={setD}
            onBack={user ? undefined : () => setStep(1)}
            onSubmit={handleDetails}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

function Loading() {
  return <div className="py-12 text-center text-[color:var(--text-tertiary)]">Loading…</div>;
}

function Stepper({ step }: { step: 1 | 2 }) {
  const items = [
    { n: 1, t: "Account" },
    { n: 2, t: "Your details" },
  ];
  return (
    <div className="flex items-center justify-between gap-4">
      {items.map((it, i) => (
        <div key={it.n} className="flex flex-1 items-center gap-3">
          <div
            className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold ${
              step >= (it.n as 1 | 2)
                ? "border-[color:var(--accent-gold)] bg-[color:var(--accent-gold)] text-[color:var(--on-gold,#fff)]"
                : "border-[color:var(--border-luxe)] text-[color:var(--text-tertiary)]"
            }`}
          >
            {it.n}
          </div>
          <span className="meta-xs text-[color:var(--text-secondary)] hidden md:block">{it.t}</span>
          {i < items.length - 1 && <Hairline className="flex-1" />}
        </div>
      ))}
    </div>
  );
}

const inputCls =
  "w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-4 py-3.5 text-[0.95rem] outline-none transition-all duration-300 placeholder:text-[color:var(--text-tertiary)] focus:border-[color:var(--accent-gold)] focus:shadow-[0_0_0_3px_var(--accent-gold-muted)]";
const labelCls = "meta-xs mb-2 block text-[color:var(--text-secondary)]";

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>;
}

function Step1Form({ values, setValues, onSubmit, submitting }: {
  values: Step1; setValues: React.Dispatch<React.SetStateAction<Step1>>;
  onSubmit: (e: React.FormEvent) => void; submitting: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-sm text-[color:var(--text-secondary)]">
        Create your stockist account. You'll sign in here any time.
      </p>
      <div>
        <label className={labelCls}>Work email *</label>
        <input type="email" required value={values.email} onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Password * (8+ characters)</label>
        <input type="password" required minLength={8} value={values.password} onChange={(e) => setValues((s) => ({ ...s, password: e.target.value }))} className={inputCls} />
      </div>
      <p className="text-xs text-[color:var(--text-tertiary)]">
        Already have an account? <Link to="/wholesale/login" search={{ redirect: "/wholesale/dashboard" }} className="ghost-link">Sign in</Link>
      </p>
      <div className="pt-2">
        <GoldButton type="submit" disabled={submitting} className="w-full md:w-auto">
          {submitting ? "Creating account…" : "Continue →"}
        </GoldButton>
      </div>
    </form>
  );
}

function DetailsForm({ values, setValues, onBack, onSubmit, submitting }: {
  values: Details; setValues: React.Dispatch<React.SetStateAction<Details>>;
  onBack?: () => void; onSubmit: (e: React.FormEvent) => void; submitting: boolean;
}) {
  const [showOptional, setShowOptional] = useState(false);
  const set = (patch: Partial<Details>) => setValues((s) => ({ ...s, ...patch }));

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldRow>
        <div>
          <label className={labelCls}>Business name *</label>
          <input required maxLength={200} value={values.business_name} onChange={(e) => set({ business_name: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Business type *</label>
          <select required value={values.business_type} onChange={(e) => set({ business_type: e.target.value })} className={inputCls}>
            <option value="dispensary">Dispensary</option>
            <option value="lounge">Lounge</option>
            <option value="specialty_retailer">Specialty Retailer</option>
            <option value="other">Other</option>
          </select>
        </div>
      </FieldRow>
      <FieldRow>
        <div>
          <label className={labelCls}>Contact name *</label>
          <input required maxLength={120} value={values.primary_contact_name} onChange={(e) => set({ primary_contact_name: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Contact phone *</label>
          <input required maxLength={30} value={values.primary_contact_phone} onChange={(e) => set({ primary_contact_phone: e.target.value })} className={inputCls} />
        </div>
      </FieldRow>
      <div>
        <label className={labelCls}>Contact email *</label>
        <input required type="email" maxLength={255} value={values.primary_contact_email} onChange={(e) => set({ primary_contact_email: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Address line 1 *</label>
        <input required maxLength={200} value={values.business_address_line_1} onChange={(e) => set({ business_address_line_1: e.target.value })} className={inputCls} />
      </div>
      <FieldRow>
        <div>
          <label className={labelCls}>City *</label>
          <input required maxLength={120} value={values.business_city} onChange={(e) => set({ business_city: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Province *</label>
          <select required value={values.business_province} onChange={(e) => set({ business_province: e.target.value })} className={inputCls}>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </FieldRow>

      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="ghost-link"
        aria-expanded={showOptional}
      >
        {showOptional ? "Hide optional details" : "Add optional details"}
      </button>

      {showOptional && (
        <div className="space-y-5 rounded-[4px] border border-dashed border-[color:var(--border-luxe)] p-5">
          <FieldRow>
            <div>
              <label className={labelCls}>Trading as</label>
              <input maxLength={200} value={values.trading_as} onChange={(e) => set({ trading_as: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estimated monthly volume</label>
              <select value={values.estimated_monthly_volume} onChange={(e) => set({ estimated_monthly_volume: e.target.value })} className={inputCls}>
                <option value="">Prefer not to say</option>
                <option value="under_50">Under 50 units</option>
                <option value="50_to_200">50 – 200</option>
                <option value="200_to_500">200 – 500</option>
                <option value="500_plus">500+</option>
              </select>
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <label className={labelCls}>VAT number</label>
              <input maxLength={40} value={values.vat_number} onChange={(e) => set({ vat_number: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Company registration number</label>
              <input maxLength={40} value={values.cipc_registration_number} onChange={(e) => set({ cipc_registration_number: e.target.value })} className={inputCls} />
            </div>
          </FieldRow>
          <FieldRow>
            <div>
              <label className={labelCls}>Address line 2</label>
              <input maxLength={200} value={values.business_address_line_2} onChange={(e) => set({ business_address_line_2: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Postal code</label>
              <input maxLength={20} value={values.business_postal_code} onChange={(e) => set({ business_postal_code: e.target.value })} className={inputCls} />
            </div>
          </FieldRow>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        {onBack ? (
          <button type="button" onClick={onBack} className="ghost-link">← Back</button>
        ) : <span />}
        <GoldButton type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Stockist Account"}
        </GoldButton>
      </div>
    </form>
  );
}
