import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WholesaleCartItem = {
  strainId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  strainType: "sativa" | "hybrid" | "indica" | null;
  boxPriceZar: number;
  boxQuantity: number;
  minimumBoxes: number;
  boxes: number;
};

type State = {
  items: WholesaleCartItem[];
  drawerOpen: boolean;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<WholesaleCartItem, "boxes">, boxes?: number) => void;
  setBoxes: (strainId: string, boxes: number) => void;
  removeItem: (strainId: string) => void;
  clear: () => void;
};

const noopStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

export const useWholesaleCart = create<State>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      addItem: (item, boxes = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.strainId === item.strainId);
          const next = existing
            ? state.items.map((i) =>
                i.strainId === item.strainId ? { ...i, boxes: i.boxes + boxes } : i,
              )
            : [...state.items, { ...item, boxes: Math.max(item.minimumBoxes, boxes) }];
          return { items: next, drawerOpen: true };
        }),
      setBoxes: (strainId, boxes) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.strainId === strainId ? { ...i, boxes: Math.max(0, boxes) } : i))
            .filter((i) => i.boxes > 0),
        })),
      removeItem: (strainId) =>
        set((state) => ({ items: state.items.filter((i) => i.strainId !== strainId) })),
      clear: () => set({ items: [], drawerOpen: false }),
    }),
    {
      name: "terps-wholesale-cart",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (noopStorage as unknown as Storage) : window.localStorage,
      ),
      partialize: (s) => ({ items: s.items }) as unknown as State,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const wholesaleCartSelectors = {
  boxCount: (s: State) => s.items.reduce((a, i) => a + i.boxes, 0),
  subtotal: (s: State) => s.items.reduce((a, i) => a + i.boxPriceZar * i.boxes, 0),
};

export const WHOLESALE_SHIPPING = 250;
export const WHOLESALE_VAT_RATE = 0.15;

export function computeWholesaleTotals(subtotal: number) {
  const shipping = WHOLESALE_SHIPPING;
  const vat = Number(((subtotal + shipping) * WHOLESALE_VAT_RATE).toFixed(2));
  const total = Number((subtotal + shipping + vat).toFixed(2));
  return { subtotal, shipping, vat, total };
}