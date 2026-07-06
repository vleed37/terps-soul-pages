import greenCrack from "@/assets/strain-green-crack.webp";
import blueDream from "@/assets/strain-blue-dream.webp";
import mangoSapphire from "@/assets/strain-mango-sapphire.webp";
import girlScoutCookie from "@/assets/strain-girl-scout-cookie.webp";
import productGreenCrack from "@/assets/product-green-crack.png";
import productBlueDream from "@/assets/product-blue-dream.jpg";
import productMangoSapphire from "@/assets/product-mango-sapphire.jpg";
import productGirlScoutCookie from "@/assets/product-girl-scout-cookie.jpg";
import productCaviarSativa from "@/assets/product-caviar-stix-sativa.jpg";
import productCaviarHybrid from "@/assets/product-caviar-stix-hybrid.jpg";
import productCaviarIndica from "@/assets/product-caviar-stix-indica.jpg";
import modelGreenCrack from "@/assets/green-crack.glb.asset.json";
import modelBlueDream from "@/assets/blue-dream.glb.asset.json";
import modelMangoSapphire from "@/assets/mango-sapphire.glb.asset.json";
import modelGirlScoutCookie from "@/assets/girl-scout-cookie.glb.asset.json";
import modelCaviarSativa from "@/assets/caviar-stix-sativa.glb.asset.json";
import modelCaviarHybrid from "@/assets/caviar-stix-hybrid.glb.asset.json";
import modelCaviarIndica from "@/assets/caviar-stix-indica.glb.asset.json";

export const STRAIN_IMAGE: Record<string, string> = {
  "green-crack": greenCrack,
  "blue-dream": blueDream,
  "mango-sapphire": mangoSapphire,
  "girl-scout-cookie": girlScoutCookie,
};

export const STRAIN_PRODUCT_IMAGE: Record<string, string> = {
  "green-crack": productGreenCrack,
  "blue-dream": productBlueDream,
  "mango-sapphire": productMangoSapphire,
  "girl-scout-cookie": productGirlScoutCookie,
  "caviar-stix-sativa": productCaviarSativa,
  "caviar-stix-hybrid": productCaviarHybrid,
  "caviar-stix-indica": productCaviarIndica,
};

export function getStrainImage(slug: string): string | undefined {
  return STRAIN_IMAGE[slug];
}

export function getStrainProductImage(slug: string): string | undefined {
  return STRAIN_PRODUCT_IMAGE[slug] ?? STRAIN_IMAGE[slug];
}

/**
 * Muted, editorial strain palettes — replaces the saturated DB values.
 * Used as low-opacity background washes on cards and hero blocks.
 */
export const STRAIN_PALETTE: Record<string, { primary: string; accent: string }> = {
  "green-crack":       { primary: "#283526", accent: "#A4B285" },
  "blue-dream":        { primary: "#2B3D52", accent: "#B8C5D2" },
  "mango-sapphire":    { primary: "#8B5A2F", accent: "#D4A87C" },
  "girl-scout-cookie": { primary: "#3D2E1F", accent: "#B89870" },
  "caviar-stix-sativa": { primary: "#283526", accent: "#A4B285" },
  "caviar-stix-hybrid": { primary: "#2B3D52", accent: "#B8C5D2" },
  "caviar-stix-indica": { primary: "#3D2A52", accent: "#B89AC9" },
};

export function getStrainPalette(slug: string): { primary: string; accent: string } {
  return STRAIN_PALETTE[slug] ?? { primary: "#283526", accent: "#A4B285" };
}

export const STRAIN_3D_MODEL: Record<string, string> = {
  "green-crack": modelGreenCrack.url,
  "blue-dream": modelBlueDream.url,
  "mango-sapphire": modelMangoSapphire.url,
  "girl-scout-cookie": modelGirlScoutCookie.url,
  "caviar-stix-sativa": modelCaviarSativa.url,
  "caviar-stix-hybrid": modelCaviarHybrid.url,
  "caviar-stix-indica": modelCaviarIndica.url,
};

export function getStrain3DModel(slug: string): string | undefined {
  return STRAIN_3D_MODEL[slug];
}
