import { expect, test } from "bun:test";
import { applyShopFilters, shopSearchSchema } from "../src/lib/shop-filters";
import type { Strain } from "../src/lib/types";

test("legacy daytime filter no longer excludes balanced and nighttime products", () => {
  const strains = ["daytime", "balanced", "nighttime"].map((effect, index) => ({
    id: String(index), name: effect, price_zar: 160, stock_quantity: 1,
    effect_category: effect, display_order: index,
  })) as Strain[];
  const search = shopSearchSchema.parse({ effect: ["daytime"] });
  expect(applyShopFilters(strains, search).map((s) => s.id)).toEqual(["0", "1", "2"]);
});