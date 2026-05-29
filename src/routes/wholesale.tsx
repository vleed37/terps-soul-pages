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
          <h1 className="mx-auto mt-6 font-display text-5xl leading-[1.05] text-[color:var(--text-on-dark,#F5EFE2)] md:text-7xl lg:text-[5.5rem]">
            Become a Terps stockist.
          </h1>
          <p className="mx-auto mt-8 max-w-xl font-display text-2xl italic text-[color:var(--text-secondary)] md:text-3xl">
            Premium pre-rolls and exclusive Caviar Stix access for curated retailers.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#apply">
              <GoldButton>Apply Now</GoldButton>
            </a>
            <Link to="/wholesale/login">
              <GoldButton variant="secondary">Stockist Sign In</GoldButton>
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>What you get</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">Built for serious retailers.</h2>
          </ScrollReveal>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { t: "Wholesale Pricing", d: "Box pricing across the full collection — Infused Pre-Rolls and Caviar Stix. Real margin for real retailers." },
              { t: "Early Access", d: "Caviar Stix drops before public release. First look at exclusive batches and limited runs." },
              { t: "Customer Routing", d: "Our Find Closest Stockist routes nearby customers to your store. The site sells for you." },
            ].map((c, i) => (
              <ScrollReveal key={c.t} delay={i * 0.1} className="rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-10">
                <div className="h-px w-12 bg-[color:var(--accent-gold)]" />
                <h3 className="mt-6 font-display text-2xl">{c.t}</h3>
                <p className="mt-4 font-body text-base leading-relaxed text-[color:var(--text-secondary)]">{c.d}</p>
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
              { n: "01", t: "Apply", d: "Create your stockist account and tell us about your store." },
              { n: "02", t: "Approve", d: "Quick review, usually within 48 hours." },
              { n: "03", t: "Stock", d: "Sign in to your portal, browse box pricing, place orders." },
            ].map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 0.1} className="text-center">
                <p className="font-display text-5xl italic text-[color:var(--accent-gold)]">{step.n}</p>
                <h3 className="mt-4 font-display text-2xl">{step.t}</h3>
                <p className="mt-3 font-body text-base text-[color:var(--text-secondary)]">{step.d}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[860px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>Application</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">Tell us about your store.</h2>
            <p className="mt-4 text-[color:var(--text-secondary)]">Step through the application. Approval typically within 48 hours.</p>
          </ScrollReveal>
          <div className="mt-16">
            <ApplyFlow />
          </div>
        </div>
      </section>
    </>
  );
}

/* ============== Application Flow ============== */

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Mpumalanga", "Limpopo", "North West", "Northern Cape",
] as const;

type Step1 = { email: string; password: string };
type Step2 = {
  business_name: string; trading_as: string; business_type: string;
  vat_number: string; cipc_registration_number: string; estimated_monthly_volume: string;
};
type Step3 = {
  primary_contact_name: string; primary_contact_email: string; primary_contact_phone: string;
  business_address_line_1: string; business_address_line_2: string; business_city: string;
  business_province: string; business_postal_code: string;
};

function ApplyFlow() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const apply = useServerFn(createWholesaleAccount);
  const getAccount = useServerFn(getMyWholesaleAccount);

  const [step, setStep] = useState<1 | 2 | 3>(user ? 2 : 1);
  const [submitting, setSubmitting] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [s1, setS1] = useState<Step1>({ email: "", password: "" });
  const [s2, setS2] = useState<Step2>({
    business_name: "", trading_as: "", business_type: "dispensary",
    vat_number: "", cipc_registration_number: "", estimated_monthly_volume: "under_50",
  });
  const [s3, setS3] = useState<Step3>({
    primary_contact_name: "", primary_contact_email: "", primary_contact_phone: "",
    business_address_line_1: "", business_address_line_2: "", business_city: "",
    business_province: "Gauteng", business_postal_code: "",
  });

  // If user already authenticated, skip step 1, and prefill contact email
  useEffect(() => {
    if (!user) return;
    setStep((s) => (s === 1 ? 2 : s));
    setS3((s) => ({ ...s, primary_contact_email: s.primary_contact_email || user.email || "" }));
    // Check if account exists
    getAccount().then((acct) => {
      if (acct) setExistingStatus(acct.approval_status);
    }).catch(() => {});
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
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setS3((s) => ({ ...s, primary_contact_email: s1.email }));
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!s2.business_name.trim()) return toast.error("Business name is required");
    setStep(3);
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apply({
        data: {
          business_name: s2.business_name,
          trading_as: s2.trading_as,
          vat_number: s2.vat_number,
          cipc_registration_number: s2.cipc_registration_number,
          business_type: s2.business_type as never,
          estimated_monthly_volume: s2.estimated_monthly_volume as never,
          primary_contact_name: s3.primary_contact_name,
          primary_contact_email: s3.primary_contact_email,
          primary_contact_phone: s3.primary_contact_phone,
          business_address_line_1: s3.business_address_line_1,
          business_address_line_2: s3.business_address_line_2,
          business_city: s3.business_city,
          business_province: s3.business_province,
          business_postal_code: s3.business_postal_code,
          business_country: "South Africa",
        },
      });
      if (!res.ok) {
        toast.error(res.error);
      } else {
        setDone(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return <Loading />;

  if (done || existingStatus) {
    const status = existingStatus ?? "pending";
    return (
      <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-12 text-center">
        {status === "approved" ? (
          <>
            <p className="font-display text-3xl italic text-[color:var(--accent-gold)] md:text-4xl">You're approved.</p>
            <p className="mt-4 text-[color:var(--text-secondary)]">Head to your stockist portal to start ordering.</p>
            <div className="mt-8">
              <Link to="/wholesale/dashboard"><GoldButton>Go to Portal</GoldButton></Link>
            </div>
          </>
        ) : status === "rejected" ? (
          <>
            <p className="font-display text-3xl italic md:text-4xl">Application declined.</p>
            <p className="mt-4 text-[color:var(--text-secondary)]">Contact <a className="ghost-link" href="mailto:sales@terpnation.co.za">sales@terpnation.co.za</a> for next steps.</p>
          </>
        ) : (
          <>
            <p className="font-display text-3xl italic text-[color:var(--accent-gold)] md:text-4xl">Application received.</p>
            <p className="mt-6 text-[color:var(--text-secondary)]">
              We'll be in touch within 48 hours. Check your email for a verification link if you just signed up.
            </p>
            <div className="mt-8">
              <button onClick={() => navigate({ to: "/shop" })}>
                <span className="ghost-link">Explore the collection →</span>
              </button>
            </div>
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
          <Step2Form
            values={s2}
            setValues={setS2}
            onBack={user ? undefined : () => setStep(1)}
            onSubmit={handleStep2}
          />
        )}
        {step === 3 && (
          <Step3Form
            values={s3}
            setValues={setS3}
            onBack={() => setStep(2)}
            onSubmit={handleStep3}
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

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, t: "Account" },
    { n: 2, t: "Business" },
    { n: 3, t: "Contact" },
  ];
  return (
    <div className="flex items-center justify-between gap-4">
      {items.map((it, i) => (
        <div key={it.n} className="flex flex-1 items-center gap-3">
          <div
            className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold ${
              step >= (it.n as 1 | 2 | 3)
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
  "w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--accent-gold)]";
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
        Create your stockist account. You'll sign in here after approval.
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
        Already have an account? <Link to="/wholesale/login" className="ghost-link">Sign in</Link>
      </p>
      <div className="pt-2">
        <GoldButton type="submit" disabled={submitting} className="w-full md:w-auto">
          {submitting ? "Creating account…" : "Continue →"}
        </GoldButton>
      </div>
    </form>
  );
}

function Step2Form({ values, setValues, onBack, onSubmit }: {
  values: Step2; setValues: React.Dispatch<React.SetStateAction<Step2>>;
  onBack?: () => void; onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldRow>
        <div>
          <label className={labelCls}>Business name *</label>
          <input required maxLength={200} value={values.business_name} onChange={(e) => setValues((s) => ({ ...s, business_name: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Trading as (optional)</label>
          <input maxLength={200} value={values.trading_as} onChange={(e) => setValues((s) => ({ ...s, trading_as: e.target.value }))} className={inputCls} />
        </div>
      </FieldRow>
      <FieldRow>
        <div>
          <label className={labelCls}>Business type *</label>
          <select required value={values.business_type} onChange={(e) => setValues((s) => ({ ...s, business_type: e.target.value }))} className={inputCls}>
            <option value="dispensary">Dispensary</option>
            <option value="lounge">Lounge</option>
            <option value="specialty_retailer">Specialty Retailer</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Estimated monthly volume *</label>
          <select required value={values.estimated_monthly_volume} onChange={(e) => setValues((s) => ({ ...s, estimated_monthly_volume: e.target.value }))} className={inputCls}>
            <option value="under_50">Under 50 units</option>
            <option value="50_to_200">50 – 200</option>
            <option value="200_to_500">200 – 500</option>
            <option value="500_plus">500+</option>
          </select>
        </div>
      </FieldRow>
      <FieldRow>
        <div>
          <label className={labelCls}>VAT number (optional)</label>
          <input maxLength={40} value={values.vat_number} onChange={(e) => setValues((s) => ({ ...s, vat_number: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>CIPC reg. number (optional)</label>
          <input maxLength={40} value={values.cipc_registration_number} onChange={(e) => setValues((s) => ({ ...s, cipc_registration_number: e.target.value }))} className={inputCls} />
        </div>
      </FieldRow>
      <div className="flex items-center justify-between pt-2">
        {onBack ? (
          <button type="button" onClick={onBack} className="ghost-link">← Back</button>
        ) : <span />}
        <GoldButton type="submit">Continue →</GoldButton>
      </div>
    </form>
  );
}

function Step3Form({ values, setValues, onBack, onSubmit, submitting }: {
  values: Step3; setValues: React.Dispatch<React.SetStateAction<Step3>>;
  onBack: () => void; onSubmit: (e: React.FormEvent) => void; submitting: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FieldRow>
        <div>
          <label className={labelCls}>Contact name *</label>
          <input required maxLength={120} value={values.primary_contact_name} onChange={(e) => setValues((s) => ({ ...s, primary_contact_name: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Contact phone *</label>
          <input required maxLength={30} value={values.primary_contact_phone} onChange={(e) => setValues((s) => ({ ...s, primary_contact_phone: e.target.value }))} className={inputCls} />
        </div>
      </FieldRow>
      <div>
        <label className={labelCls}>Contact email *</label>
        <input required type="email" maxLength={255} value={values.primary_contact_email} onChange={(e) => setValues((s) => ({ ...s, primary_contact_email: e.target.value }))} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Address line 1 *</label>
        <input required maxLength={200} value={values.business_address_line_1} onChange={(e) => setValues((s) => ({ ...s, business_address_line_1: e.target.value }))} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Address line 2 (optional)</label>
        <input maxLength={200} value={values.business_address_line_2} onChange={(e) => setValues((s) => ({ ...s, business_address_line_2: e.target.value }))} className={inputCls} />
      </div>
      <FieldRow>
        <div>
          <label className={labelCls}>City *</label>
          <input required maxLength={120} value={values.business_city} onChange={(e) => setValues((s) => ({ ...s, business_city: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Province *</label>
          <select required value={values.business_province} onChange={(e) => setValues((s) => ({ ...s, business_province: e.target.value }))} className={inputCls}>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </FieldRow>
      <div>
        <label className={labelCls}>Postal code</label>
        <input maxLength={20} value={values.business_postal_code} onChange={(e) => setValues((s) => ({ ...s, business_postal_code: e.target.value }))} className={inputCls} />
      </div>
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack} className="ghost-link">← Back</button>
        <GoldButton type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Application"}
        </GoldButton>
      </div>
    </form>
  );
}