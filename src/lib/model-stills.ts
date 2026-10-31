import greenCrack from "@/assets/model-stills/green-crack.png.asset.json";
import blueDream from "@/assets/model-stills/blue-dream.png.asset.json";
import mangoSapphire from "@/assets/model-stills/mango-sapphire.png.asset.json";
import girlScoutCookie from "@/assets/model-stills/girl-scout-cookie.png.asset.json";
import caviarSativa from "@/assets/model-stills/caviar-stix-sativa.png.asset.json";
import caviarHybrid from "@/assets/model-stills/caviar-stix-hybrid.png.asset.json";
import caviarIndica from "@/assets/model-stills/caviar-stix-indica.png.asset.json";
import { STRAIN_3D_MODEL } from "@/lib/strain-assets";

const stills: Record<string, string> = {
  "green-crack": greenCrack.url,
  "blue-dream": blueDream.url,
  "mango-sapphire": mangoSapphire.url,
  "girl-scout-cookie": girlScoutCookie.url,
  "caviar-stix-sativa": caviarSativa.url,
  "caviar-stix-hybrid": caviarHybrid.url,
  "caviar-stix-indica": caviarIndica.url,
};

/** Actual WebGL captures of the same models, never substitute photography. */
export function getModelStill(url: string): string | undefined {
  const slug = Object.keys(STRAIN_3D_MODEL).find((key) => STRAIN_3D_MODEL[key] === url);
  return slug ? stills[slug] : undefined;
}