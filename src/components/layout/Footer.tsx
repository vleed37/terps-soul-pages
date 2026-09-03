import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Hairline } from "@/components/brand/Hairline";
import { Lock } from "lucide-react";
import { SALES_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/brand";

export function Footer() {


  return (
    <footer className="tone-dark border-t border-[color:var(--border-on-dark)] pt-24 pb-10">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          <div>
            <Logo height={44} onTone="dark" />
          </div>

          <div>
            <h4 className="meta-xs mb-6 text-gold">Explore</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link to="/shop" className="hover:text-[color:var(--accent-gold)]">The Collection</Link></li>
              <li><Link to="/strains" className="hover:text-[color:var(--accent-gold)]">Strains</Link></li>
              <li><Link to="/stockists" className="hover:text-[color:var(--accent-gold)]">Stockists</Link></li>
              <li><Link to="/about" className="hover:text-[color:var(--accent-gold)]">Our Story</Link></li>
              <li><Link to="/wholesale" className="hover:text-[color:var(--accent-gold)]">Wholesale</Link></li>
              <li><Link to="/wholesale/login" search={{ redirect: "/wholesale/dashboard" }} className="hover:text-[color:var(--accent-gold)]">Wholesale Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="meta-xs mb-6 text-gold">Legal</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link to="/legal/terms" className="hover:text-[color:var(--accent-gold)]">Terms of Sale</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-[color:var(--accent-gold)]">Privacy Policy</Link></li>
              <li><Link to="/legal/refunds" className="hover:text-[color:var(--accent-gold)]">Refund Policy</Link></li>
              <li><Link to="/legal/shipping" className="hover:text-[color:var(--accent-gold)]">Shipping Policy</Link></li>
              <li><Link to="/legal/cannabis-disclaimer" className="hover:text-[color:var(--accent-gold)]">Cannabis Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="meta-xs mb-6 text-gold">Connect</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><a href="https://instagram.com/terps.official_" className="hover:text-[color:var(--accent-gold)]">@terps.official_</a></li>
              <li><a href={`mailto:${SALES_EMAIL}`} className="hover:text-[color:var(--accent-gold)]">{SALES_EMAIL}</a></li>
            </ul>
          </div>

        </div>
        <Hairline className="my-12" />
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="meta-xs flex items-center gap-2 text-[color:var(--text-tertiary)]">
            <Link
              to="/legal/cannabis-disclaimer"
              aria-label="Cannabis disclaimer"
              className="inline-flex items-center gap-1 hover:text-[color:var(--accent-gold)]"
            >
              <Lock className="h-3 w-3" strokeWidth={1.5} />
              18+
            </Link>
          </p>

          <p className="meta-xs text-[color:var(--text-tertiary)]">© 2026 Terps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
