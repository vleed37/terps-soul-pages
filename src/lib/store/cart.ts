import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  strainId: string;
  slug: string;
  name: string;
  priceZar: number;
  weightGrams: number;
  imageUrl?: string;
  accentPrimary?: string;
  accentAccent?: string;
  maxStock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (strainId: string) => void;
  setQuantity: (strainId: string, qty: number) => void;
  clear: () => void;
};

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.strainId === item.strainId);
          const items = existing
            ? state.items.map((i) =>
                i.strainId === item.strainId
                  ? { ...i, quantity: Math.min(i.maxStock, i.quantity + qty) }
                  : i,
              )
            : [...state.items, { ...item, quantity: Math.min(item.maxStock, qty) }];
          return { items, drawerOpen: true };
        }),
      removeItem: (strainId) =>
        set((state) => ({ items: state.items.filter((i) => i.strainId !== strainId) })),
      setQuantity: (strainId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.strainId === strainId
                ? { ...i, quantity: Math.max(0, Math.min(i.maxStock, qty)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [], drawerOpen: false }),
    }),
    {
      name: "terps-cart",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (noopStorage as unknown as Storage) : window.localStorage,
      ),
      partialize: (s) => ({ items: s.items }) as unknown as CartState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const cartSelectors = {
  itemCount: (s: CartState) => s.items.reduce((a, i) => a + i.quantity, 0),
  subtotal: (s: CartState) => s.items.reduce((a, i) => a + i.priceZar * i.quantity, 0),
};

export const DELIVERY_FEE = 80;
export const FREE_DELIVERY_THRESHOLD = 500;

export function computeTotals(subtotal: number, method: "delivery" | "collect") {
  const deliveryFee =
    method === "collect" ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}