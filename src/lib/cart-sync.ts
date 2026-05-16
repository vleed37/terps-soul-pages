import { mergeCart, clearMyServerCart } from "./cart-sync.functions";
import { useCart } from "./store/cart";

/**
 * Merge local Zustand cart with the server-side cart for the signed-in user,
 * then rehydrate the local store with the merged result.
 */
export async function syncCartOnSignIn() {
  const state = useCart.getState();
  const localItems = state.items.map((i) => ({
    strainId: i.strainId,
    quantity: i.quantity,
  }));

  try {
    const res = await mergeCart({ data: { items: localItems } });
    useCart.setState({
      items: res.items.map((i) => ({
        strainId: i.strainId,
        slug: i.slug,
        name: i.name,
        priceZar: i.priceZar,
        weightGrams: i.weightGrams,
        maxStock: i.maxStock,
        accentPrimary: i.accentPrimary,
        accentAccent: i.accentAccent,
        quantity: i.quantity,
      })),
    });
  } catch (e) {
    // Non-fatal: keep local cart, log for debugging.
    console.warn("[cart-sync] mergeCart failed", e);
  }
}

export async function clearServerCart() {
  try {
    await clearMyServerCart();
  } catch (e) {
    console.warn("[cart-sync] clearMyServerCart failed", e);
  }
}
