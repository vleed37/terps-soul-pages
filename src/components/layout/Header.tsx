import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, User, ShoppingBag, X, Sun, Moon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useCart, cartSelectors } from "@/lib/store/cart";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/shop", label: "The Collection" },
  { to: "/strains", label: "Strains" },
  { to: "/stockists", label: "Stockists" },
  { to: "/about", label: "Our Story" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const openCart = useCart((s) => s.openDrawer);
  const itemCount = useCart(cartSelectors.itemCount);
  const hydrated = useCart((s) => s.hydrated);
  const { theme, toggle, mounted } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          scrolled
            ? "h-[64px] bg-[color:var(--bg-base)]/85 backdrop-blur-xl border-b border-[color:var(--border-subtle)]"
            : "h-[88px] bg-transparent",
        )}
      >
        {/* Desktop: logo-left, nav + utilities on the right */}
        <div className="mx-auto hidden h-full max-w-[1400px] items-center justify-between px-6 md:flex md:px-8">
          <Link to="/" className="flex items-center">
            <Logo height={scrolled ? 36 : 48} />
          </Link>

          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="meta-xs underline-grow text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)] transition-colors"
                activeProps={{ "data-status": "active" } as any}
              >
                {item.label}
              </Link>
            ))}
            </nav>
            <div className="flex items-center gap-5 border-l border-[color:var(--border-subtle)] pl-8">
            <button
              aria-label="Toggle theme"
              onClick={toggle}
              className="text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)] transition-transform duration-300 hover:scale-105 hover:rotate-12"
            >
              {mounted && theme === "light"
                ? <Moon strokeWidth={1.5} className="h-[18px] w-[18px]" />
                : <Sun strokeWidth={1.5} className="h-[18px] w-[18px]" />}
            </button>
            <button aria-label="Search" className="text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]">
              <Search strokeWidth={1.5} className="h-5 w-5" />
            </button>
            <Link to="/account" aria-label="Account" className="text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]">
              <User strokeWidth={1.5} className="h-5 w-5" />
            </Link>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]"
            >
              <ShoppingBag strokeWidth={1.5} className="h-5 w-5" />
              {hydrated && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[color:var(--accent-gold)] px-1 text-[10px] font-bold text-[color:var(--on-gold)]">
                  {itemCount}
                </span>
              )}
            </button>
            </div>
          </div>
        </div>

        {/* Mobile: menu-left, centered wordmark, cart-right */}
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 md:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]"
          >
            <Menu strokeWidth={1.5} className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center">
            <Logo height={scrolled ? 32 : 40} />
          </Link>
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle theme"
              onClick={toggle}
              className="text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]"
            >
              {mounted && theme === "light"
                ? <Moon strokeWidth={1.5} className="h-[18px] w-[18px]" />
                : <Sun strokeWidth={1.5} className="h-[18px] w-[18px]" />}
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]"
            >
              <ShoppingBag strokeWidth={1.5} className="h-5 w-5" />
              {hydrated && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[color:var(--accent-gold)] px-1 text-[10px] font-bold text-[color:var(--on-gold)]">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[color:var(--bg-rich)] md:hidden">
          <div className="flex h-[88px] items-center justify-between px-6">
            <Logo height={56} />
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="text-[color:var(--text-primary)]">
              <X strokeWidth={1.5} className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-8 px-8">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-display text-5xl font-normal text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-8 pb-12 meta-xs text-[color:var(--text-tertiary)]">
            18+ · Bred in South Africa
          </div>
        </div>
      )}
    </>
  );
}
