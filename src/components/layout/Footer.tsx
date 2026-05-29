import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Hairline } from "@/components/brand/Hairline";
import { subscribeEmail } from "@/lib/forms.functions";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await subscribeEmail({ data: { email, source: "footer" } });
      setDone(true);
    } catch (e: any) {
      setErr("Try again with a valid email.");
    }
  }

  return (
    <footer className="tone-dark border-t border-[color:var(--border-on-dark)] pt-24 pb-10">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div>
            <Logo height={64} onTone="dark" />
            <p className="mt-6 font-display text-2xl italic text-[color:var(--text-primary)]">Flavour First.</p>
          </div>
          <div>
            <h4 className="meta-xs mb-6 text-gold">Explore</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link to="/shop" className="hover:text-[color:var(--accent-gold)]">The Collection</Link></li>
              <li><Link to="/strains" className="hover:text-[color:var(--accent-gold)]">Strains</Link></li>
              <li><Link to="/stockists" className="hover:text-[color:var(--accent-gold)]">Stockists</Link></li>
              <li><Link to="/about" className="hover:text-[color:var(--accent-gold)]">Our Story</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="meta-xs mb-6 text-gold">Connect</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><a href="https://instagram.com/terps.official_" className="hover:text-[color:var(--accent-gold)]">@terps.official_</a></li>
              <li><a href="mailto:sales@terpnation.co.za" className="hover:text-[color:var(--accent-gold)]">sales@terpnation.co.za</a></li>
            </ul>
            {done ? (
              <p className="mt-8 font-display italic text-[color:var(--accent-gold)]">You're on the list.</p>
            ) : (
              <form onSubmit={submit} className="mt-8 flex items-center gap-2 border-b border-[color:var(--border-strong)] pb-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[color:var(--text-tertiary)]"
                />
                <button type="submit" aria-label="Subscribe" className="text-[color:var(--accent-gold)] hover:text-[color:var(--accent-gold-hover)]">
                  <ArrowRight strokeWidth={1.5} className="h-5 w-5" />
                </button>
              </form>
            )}
            {err && <p className="mt-2 text-xs text-[color:var(--status-error)]">{err}</p>}
          </div>
        </div>
        <Hairline className="my-12" />
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="meta-xs text-[color:var(--text-tertiary)]">18+ · Bred in South Africa · Batch 04 active</p>
          <p className="meta-xs text-[color:var(--text-tertiary)]">© 2026 Terps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
