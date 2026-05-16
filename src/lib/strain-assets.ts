import greenCrack from "@/assets/strain-green-crack.webp";
import blueDream from "@/assets/strain-blue-dream.webp";
import mangoSapphire from "@/assets/strain-mango-sapphire.webp";
import girlScoutCookie from "@/assets/strain-girl-scout-cookie.webp";
import productGreenCrack from "@/assets/product-green-crack.png";
import productBlueDream from "@/assets/product-blue-dream.jpg";
import productMangoSapphire from "@/assets/product-mango-sapphire.jpg";
import productGirlScoutCookie from "@/assets/product-girl-scout-cookie.jpg";

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
};

export function getStrainImage(slug: string): string | undefined {
  return STRAIN_IMAGE[slug];
}

export function getStrainProductImage(slug: string): string | undefined {
  return STRAIN_PRODUCT_IMAGE[slug] ?? STRAIN_IMAGE[slug];
}
