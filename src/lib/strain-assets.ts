import greenCrack from "@/assets/strain-green-crack.webp";
import blueDream from "@/assets/strain-blue-dream.webp";
import mangoSapphire from "@/assets/strain-mango-sapphire.webp";
import girlScoutCookie from "@/assets/strain-girl-scout-cookie.webp";

export const STRAIN_IMAGE: Record<string, string> = {
  "green-crack": greenCrack,
  "blue-dream": blueDream,
  "mango-sapphire": mangoSapphire,
  "girl-scout-cookie": girlScoutCookie,
};

export function getStrainImage(slug: string): string | undefined {
  return STRAIN_IMAGE[slug];
}
