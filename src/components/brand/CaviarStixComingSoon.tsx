import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";
import { MetaLabel } from "./MetaLabel";
import { Hairline } from "./Hairline";
import { GoldButton } from "./GoldButton";
import { subscribeEmail } from "@/lib/forms.functions";

export function CaviarStixComingSoon() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await subscribeEmail({ data: { email, source: "caviar-stix-coming-soon" } });
      setDone(true);
    } catch {
      setErr("Please enter a valid email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tone-dark relative overflow-hidden px-6 py-40 md:py-48">
      {/* sage glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle, rgba(139,149,119,0.07) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div className="relative mx-auto max-w-[720px] text-center">
        <ScrollReveal>
          <MetaLabel gold>✦ Coming Soon</MetaLabel>
          <h2 className="mt-6 font-display text-6xl leading-[1.02] tracking-[-0.02em] md:text-8xl">
            Caviar Stix.
          </h2>
          <p className="mt-5 font-display text-[1.5rem] italic text-[color:var(--text-secondary)] md:text-[1.75rem]">
            The cream of the crop. Loading.
          </p>
          <p className="mx-auto mt-8 max-w-[580px] text-base leading-[1.65] text-[color:var(--text-secondary)] md:text-lg">
            Premium indoor flower, layered with hash, crumble, and live rosin. Three variants —
            sativa, hybrid, indica. The most refined expression of what Terps can do.
          </p>
          <Hairline w="120px" className="mx-auto my-10" />
          <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--text-tertiary)]">
            Drops in two weeks. Be the first to know.
          </p>

          {done ? (
            <p className="mt-8 font-display text-2xl italic text-[color:var(--accent-gold)]">
              ✓ You're on the list. We'll be in touch.
            </p>
          ) : (
            <form
              onSubmit={submit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-5 py-4 text-sm outline-none focus:border-[color:var(--accent-gold)]"
              />
              <GoldButton type="submit" variant="cream" disabled={busy}>
                {busy ? "Sending…" : "Notify me"}
              </GoldButton>
            </form>
          )}
          {err && <p className="mt-3 text-sm text-[color:var(--status-error)]">{err}</p>}
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[color:var(--text-tertiary)]">
            Limited first batch. First-come, first-served.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}