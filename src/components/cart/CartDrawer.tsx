import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart, cartSelectors, computeTotals, FREE_DELIVERY_THRESHOLD } from "@/lib/store/cart";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const close = useCart((s) => s.closeDrawer);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.removeItem);
  const itemCount = useCart(cartSelectors.itemCount);
  const subtotal = useCart(cartSelectors.subtotal);
  const totals = computeTotals(subtotal, "delivery");
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-[480px] flex-col border-l border-[color:var(--border-luxe)] bg-[color:var(--bg-rich)]"
          >
            <header className="flex items-center justify-between px-8 py-6">
              <div>
                <MetaLabel gold>Your Collection</MetaLabel>
                <h2 className="mt-2 font-display text-3xl">
                  {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
                </h2>
              </div>
              <button
                aria-label="Close cart"
                onClick={close}
                className="text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]"
              >
                <X strokeWidth={1.5} className="h-6 w-6" />
              </button>
            </header>
            <Hairline className="mx-8" />

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-2xl italic text-[color:var(--text-secondary)]">
                    Nothing here yet.
                  </p>
                  <Link to="/shop" onClick={close} className="ghost-link mt-6">
                    Browse the collection →
                  </Link>
                </div>
              ) : (
                <ul className="space-y-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.strainId}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="flex gap-4"
                      >
                        <div
                          className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[4px] border border-[color:var(--border-subtle)]"
                          style={{
                            background: `radial-gradient(ellipse at center, ${item.accentAccent ?? "#6CC840"}22, ${item.accentPrimary ?? "#1F3A2A"}11)`,
                          }}
                        >
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="absolute inset-0 h-full w-full object-contain p-2"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg leading-tight">{item.name}</h3>
                          <p className="meta-xs mt-1 text-[color:var(--text-tertiary)]">
                            {item.weightGrams}g · Live rosin
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 rounded-[4px] border border-[color:var(--border-subtle)]">
                              <button
                                aria-label="Decrease"
                                onClick={() => setQty(item.strainId, item.quantity - 1)}
                                className="grid h-7 w-7 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
                              >
                                <Minus strokeWidth={1.5} className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-[1.5ch] text-center text-sm">{item.quantity}</span>
                              <button
                                aria-label="Increase"
                                disabled={item.quantity >= item.maxStock}
                                onClick={() => setQty(item.strainId, item.quantity + 1)}
                                className="grid h-7 w-7 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)] disabled:opacity-30"
                              >
                                <Plus strokeWidth={1.5} className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="font-body text-sm font-semibold">
                              R{(item.priceZar * item.quantity).toFixed(0)}
                            </span>
                          </div>
                        </div>
                        <button
                          aria-label="Remove"
                          onClick={() => remove(item.strainId)}
                          className="self-start text-[color:var(--text-tertiary)] hover:text-[color:var(--accent-gold)]"
                        >
                          <Trash2 strokeWidth={1.5} className="h-4 w-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-[color:var(--border-luxe)] bg-[color:var(--bg-base)]/60 px-8 py-6">
                {remainingForFree > 0 && (
                  <p className="meta-xs mb-4 text-[color:var(--text-tertiary)]">
                    R{remainingForFree.toFixed(0)} more for free delivery
                  </p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[color:var(--text-secondary)]">
                    <span>Subtotal</span>
                    <span>R{totals.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-[color:var(--text-secondary)]">
                    <span>Delivery</span>
                    <span>{totals.deliveryFee === 0 ? "Free" : `R${totals.deliveryFee}`}</span>
                  </div>
                  <Hairline className="my-3" />
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-lg">Total</span>
                    <span className="font-body text-xl font-semibold">R{totals.total.toFixed(0)}</span>
                  </div>
                </div>
                <Link to="/checkout" onClick={close} className="mt-6 block">
                  <GoldButton className="w-full">Proceed to Checkout</GoldButton>
                </Link>
                <button
                  onClick={close}
                  className="mt-3 w-full text-center meta-xs text-[color:var(--text-tertiary)] hover:text-[color:var(--accent-gold)]"
                >
                  Continue browsing
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}