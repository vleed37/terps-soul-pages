import { useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  useWholesaleCart,
  wholesaleCartSelectors,
  WHOLESALE_SHIPPING,
  WHOLESALE_VAT_RATE,
} from "@/lib/store/wholesale-cart";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";

export function WholesaleCartDrawer() {
  const open = useWholesaleCart((s) => s.drawerOpen);
  const close = useWholesaleCart((s) => s.closeDrawer);
  const items = useWholesaleCart((s) => s.items);
  const setBoxes = useWholesaleCart((s) => s.setBoxes);
  const removeItem = useWholesaleCart((s) => s.removeItem);
  const subtotal = useWholesaleCart(wholesaleCartSelectors.subtotal);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const vat = (subtotal + WHOLESALE_SHIPPING) * WHOLESALE_VAT_RATE;
  const total = subtotal + WHOLESALE_SHIPPING + vat;

  return (
    <div className="fixed inset-0 z-[80]">
      <button aria-label="Close" onClick={close} className="absolute inset-0 bg-black/50" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-[color:var(--bg-base)] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[color:var(--border-subtle)] px-6 py-5">
          <div>
            <MetaLabel gold>Wholesale Cart</MetaLabel>
            <p className="mt-1 font-display text-xl">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={close} aria-label="Close cart" className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-[color:var(--text-tertiary)]">
              Your cart is empty.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--border-subtle)]">
              {items.map((it) => (
                <li key={it.strainId} className="flex gap-4 py-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[4px] bg-[color:var(--bg-surface)]">
                    {it.imageUrl && <img src={it.imageUrl} alt={it.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base leading-tight">{it.name}</p>
                    <p className="meta-xs text-[color:var(--text-tertiary)]">
                      R{it.boxPriceZar.toFixed(0)}/box · {it.boxQuantity} units
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBoxes(it.strainId, Math.max(0, it.boxes - 1))}
                          className="grid h-7 w-7 place-items-center rounded border border-[color:var(--border-luxe)] hover:border-[color:var(--accent-gold)]"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[2ch] text-center font-semibold">{it.boxes}</span>
                        <button
                          onClick={() => setBoxes(it.strainId, it.boxes + 1)}
                          className="grid h-7 w-7 place-items-center rounded border border-[color:var(--border-luxe)] hover:border-[color:var(--accent-gold)]"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-display text-base">R{(it.boxPriceZar * it.boxes).toFixed(0)}</p>
                    </div>
                    <button onClick={() => removeItem(it.strainId)} className="mt-2 text-xs text-[color:var(--text-tertiary)] hover:text-[color:var(--accent-gold)]">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-[color:var(--border-subtle)] px-6 py-5">
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={`R${subtotal.toFixed(0)}`} />
              <Row label="Shipping (flat)" value={`R${WHOLESALE_SHIPPING.toFixed(0)}`} />
              <Row label="VAT (15%)" value={`R${vat.toFixed(0)}`} />
            </div>
            <Hairline className="my-4" />
            <div className="flex items-baseline justify-between">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-2xl">R{total.toFixed(0)}</span>
            </div>
            <Link to="/wholesale/dashboard/checkout" onClick={close} className="mt-5 block">
              <GoldButton className="w-full">Checkout →</GoldButton>
            </Link>
          </footer>
        )}
      </aside>
    </div>
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