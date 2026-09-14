import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { VAT_RATE, WHOLESALE_DELIVERY_FEE } from "@/lib/brand";
import { lineTotalZar, resolveTierPrice, type WholesalePriceTier } from "@/lib/wholesale-pricing";
import type { ProductLine } from "@/lib/product-lines";

export type WholesaleCartItem = {
  strainId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  strainType: "sativa" | "hybrid" | "indica" | null;
  /** Display-only tier ladder supplied by the protected server catalogue. */
  tiers: WholesalePriceTier[];
  boxQuantity: number;
  minimumBoxes: number;
  boxes: number;
};

/** A variety box: several strains from ONE product line inside one box. */
export type MixedBoxEntry = {
  strainId: string;
  slug: string;
  name: string;
  units: number;
};

export type MixedBoxItem = {
  /** Local identifier only — the server recreates the line from scratch. */
  id: string;
  productLine: ProductLine;
  /** Units in one full box, from the protected wholesale config. */
  boxQuantity: number;
  tiers: WholesalePriceTier[];
  composition: MixedBoxEntry[];
  boxes: number;
};

/** Display-only: the server recalculates every price at checkout. */
export function itemBoxPrice(item: { tiers: WholesalePriceTier[]; boxes: number }): number {
  return resolveTierPrice(item.tiers ?? [], item.boxes);
}

export function itemLineTotal(item: { tiers: WholesalePriceTier[]; boxes: number }): number {
  return lineTotalZar(item.tiers ?? [], item.boxes);
}

type State = {
  items: WholesaleCartItem[];
  mixedBoxes: MixedBoxItem[];
  drawerOpen: boolean;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<WholesaleCartItem, "boxes">, boxes?: number) => void;
  setBoxes: (strainId: string, boxes: number) => void;
  removeItem: (strainId: string) => void;
  addMixedBox: (box: Omit<MixedBoxItem, "id">) => void;
  setMixedBoxes: (id: string, boxes: number) => void;
  removeMixedBox: (id: string) => void;
  clear: () => void;
};

const noopStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `mb_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const useWholesaleCart = create<State>()(
  persist(
    (set) => ({
      items: [],
      mixedBoxes: [],
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
      addMixedBox: (box) =>
        set((state) => ({
          mixedBoxes: [...state.mixedBoxes, { ...box, id: newId() }],
          drawerOpen: true,
        })),
      setMixedBoxes: (id, boxes) =>
        set((state) => ({
          mixedBoxes: state.mixedBoxes
            .map((b) => (b.id === id ? { ...b, boxes: Math.max(0, boxes) } : b))
            .filter((b) => b.boxes > 0),
        })),
      removeMixedBox: (id) =>
        set((state) => ({ mixedBoxes: state.mixedBoxes.filter((b) => b.id !== id) })),
      clear: () => set({ items: [], mixedBoxes: [], drawerOpen: false }),
    }),
    {
      name: "terps-wholesale-cart",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (noopStorage as unknown as Storage) : window.localStorage,
      ),
      partialize: (s) => ({ items: s.items, mixedBoxes: s.mixedBoxes }) as unknown as State,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const wholesaleCartSelectors = {
  lineCount: (s: State) => s.items.length + s.mixedBoxes.length,
  boxCount: (s: State) =>
    s.items.reduce((a, i) => a + i.boxes, 0) + s.mixedBoxes.reduce((a, b) => a + b.boxes, 0),
  subtotal: (s: State) =>
    Number(
      (
        s.items.reduce((a, i) => a + itemLineTotal(i), 0) +
        s.mixedBoxes.reduce((a, b) => a + itemLineTotal(b), 0)
      ).toFixed(2),
    ),
};

export const WHOLESALE_SHIPPING = WHOLESALE_DELIVERY_FEE;
export const WHOLESALE_VAT_RATE = VAT_RATE;

export function computeWholesaleTotals(subtotal: number) {
  const shipping = WHOLESALE_SHIPPING;
  const vat = Number(((subtotal + shipping) * WHOLESALE_VAT_RATE).toFixed(2));
  const total = Number((subtotal + shipping + vat).toFixed(2));
  return { subtotal, shipping, vat, total };
}
