import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { VAT_RATE, WHOLESALE_DELIVERY_FEE } from "@/lib/brand";
import {
  wholesaleBoxPrice,
  wholesaleLineTotal,
  type WholesalePriceTier,
  type WholesaleProductLine,
} from "@/lib/wholesale-pricing";

export type MixedBoxComponent = {
  strainId: string;
  name: string;
  units: number;
  imageUrl?: string | null;
};

type CartLineBase = {
  /** Stable identity for this basket line. */
  key: string;
  productLine: WholesaleProductLine;
  /** Display-only tier ladder supplied by the protected server catalogue. */
  tiers: WholesalePriceTier[];
  boxQuantity: number;
  minimumBoxes: number;
  boxes: number;
};

export type WholesaleSingleStrainLine = CartLineBase & {
  kind: "single_strain";
  strainId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  strainType: "sativa" | "hybrid" | "indica" | null;
};

export type WholesaleMixedBoxLine = CartLineBase & {
  kind: "mixed_box";
  /** Units of each strain contained in ONE box. */
  composition: MixedBoxComponent[];
};

export type WholesaleCartItem = WholesaleSingleStrainLine | WholesaleMixedBoxLine;

export function singleStrainKey(strainId: string): string {
  return `s:${strainId}`;
}

export function mixedBoxKey(
  productLine: WholesaleProductLine,
  composition: MixedBoxComponent[],
): string {
  const sig = [...composition]
    .sort((a, b) => a.strainId.localeCompare(b.strainId))
    .map((c) => `${c.strainId}x${c.units}`)
    .join("|");
  return `m:${productLine}:${sig}`;
}

/** Display-only: the server recalculates every price at checkout. */
export function itemBoxPrice(item: WholesaleCartItem): number {
  return wholesaleBoxPrice(item.tiers ?? [], item.boxes);
}

export function itemLineTotal(item: WholesaleCartItem): number {
  return wholesaleLineTotal(item.tiers ?? [], item.boxes);
}

export function itemLabel(item: WholesaleCartItem): string {
  return item.kind === "single_strain"
    ? item.name
    : item.productLine === "caviar_stix"
      ? "Mixed box — Caviar Stix"
      : "Mixed box — Pre-Rolls";
}

type State = {
  items: WholesaleCartItem[];
  drawerOpen: boolean;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (
    item: Omit<WholesaleSingleStrainLine, "boxes" | "kind" | "key">,
    boxes?: number,
  ) => void;
  addMixedBox: (item: Omit<WholesaleMixedBoxLine, "boxes" | "kind" | "key">, boxes?: number) => void;
  setBoxes: (key: string, boxes: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const noopStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

function mergeLine(items: WholesaleCartItem[], line: WholesaleCartItem): WholesaleCartItem[] {
  const existing = items.find((i) => i.key === line.key);
  if (existing) {
    return items.map((i) => (i.key === line.key ? { ...i, boxes: i.boxes + line.boxes } : i));
  }
  return [...items, line];
}

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
        set((state) => ({
          items: mergeLine(state.items, {
            ...item,
            kind: "single_strain",
            key: singleStrainKey(item.strainId),
            boxes: Math.max(item.minimumBoxes, boxes),
          }),
          drawerOpen: true,
        })),
      addMixedBox: (item, boxes = 1) =>
        set((state) => ({
          items: mergeLine(state.items, {
            ...item,
            kind: "mixed_box",
            key: mixedBoxKey(item.productLine, item.composition),
            boxes: Math.max(item.minimumBoxes, boxes),
          }),
          drawerOpen: true,
        })),
      setBoxes: (key, boxes) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, boxes: Math.max(0, boxes) } : i))
            .filter((i) => i.boxes > 0),
        })),
      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], drawerOpen: false }),
    }),
    {
      name: "terps-wholesale-cart",
      version: 2,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (noopStorage as unknown as Storage) : window.localStorage,
      ),
      partialize: (s) => ({ items: s.items }) as unknown as State,
      // v1 stored bare single-strain lines keyed by strainId, with no kind/key/productLine.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as { items?: unknown[] };
        if (version >= 2) return state as unknown as State;
        const items = (state.items ?? [])
          .map((raw) => {
            const i = raw as Partial<WholesaleSingleStrainLine> & { strainId?: string };
            if (!i.strainId) return null;
            return {
              ...i,
              kind: "single_strain" as const,
              key: singleStrainKey(i.strainId),
              productLine: (i.productLine ?? "pre_roll") as WholesaleProductLine,
              tiers: i.tiers ?? [],
              boxQuantity: i.boxQuantity ?? 20,
              minimumBoxes: i.minimumBoxes ?? 1,
              boxes: i.boxes ?? 1,
            } as WholesaleCartItem;
          })
          .filter((i): i is WholesaleCartItem => i !== null);
        return { items } as unknown as State;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const wholesaleCartSelectors = {
  boxCount: (s: State) => s.items.reduce((a, i) => a + i.boxes, 0),
  subtotal: (s: State) => Number(s.items.reduce((a, i) => a + itemLineTotal(i), 0).toFixed(2)),
};

export const WHOLESALE_SHIPPING = WHOLESALE_DELIVERY_FEE;
export const WHOLESALE_VAT_RATE = VAT_RATE;

export function computeWholesaleTotals(subtotal: number) {
  const shipping = WHOLESALE_SHIPPING;
  const vat = Number(((subtotal + shipping) * WHOLESALE_VAT_RATE).toFixed(2));
  const total = Number((subtotal + shipping + vat).toFixed(2));
  return { subtotal, shipping, vat, total };
}

/** Server payload: never carries prices — the server re-resolves every amount. */
export function toOrderLines(items: WholesaleCartItem[]) {
  return items.map((i) =>
    i.kind === "single_strain"
      ? { kind: "single_strain" as const, strainId: i.strainId, boxes: i.boxes }
      : {
          kind: "mixed_box" as const,
          productLine: i.productLine,
          boxes: i.boxes,
          composition: i.composition.map((c) => ({ strainId: c.strainId, units: c.units })),
        },
  );
}
