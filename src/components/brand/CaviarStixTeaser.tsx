import { ScrollReveal } from "./ScrollReveal";
import { MetaLabel } from "./MetaLabel";
import { Hairline } from "./Hairline";
import { GoldButton } from "./GoldButton";
import caviarIndica from "@/assets/shoot/divine-115.jpg.asset.json";
import caviarHybrid from "@/assets/shoot/divine-116.jpg.asset.json";
import caviarSativa from "@/assets/shoot/divine-117.jpg.asset.json";

/** Swap-in point for Caviar Stix product photography. 2–3 images. */
const CAVIAR_IMAGES: { src: string; alt: string }[] = [
  { src: caviarIndica.url, alt: "Terps Caviar Stix Indica" },
  { src: caviarHybrid.url, alt: "Terps Caviar Stix Hybrid" },
  { src: caviarSativa.url, alt: "Terps Caviar Stix Sativa" },
];

export function CaviarStixTeaser() {
  return (
    <section className="tone-dark relative overflow-hidden px-6 py-32 md:py-40">
      {/* sage glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(circle, rgba(139,149,119,0.07) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div className="relative mx-auto max-w-[900px] text-center">
        <ScrollReveal>
          <MetaLabel gold>✦ Caviar Stix</MetaLabel>
          <h2 className="mx-auto mt-6 max-w-[700px] font-display text-[2.5rem] font-semibold leading-[1.03] tracking-[-0.01em] md:text-[4.5rem]">
            Caviar Stix
          </h2>
          <p className="mt-5 font-display text-[1.35rem] italic text-[color:var(--text-secondary)] md:text-[1.6rem]">
            Cream of the crop.
          </p>
          <Hairline w="120px" className="mx-auto my-10" />
          <p className="mx-auto max-w-[620px] text-base leading-[1.65] text-[color:var(--text-secondary)] md:text-lg">
            Taking our infused pre-rolls to the next level. Coated with live rosin and sprinkled with
            a generous amount of hash.
          </p>
          {CAVIAR_IMAGES.length > 0 && (
            <div
              className={`mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 ${
                CAVIAR_IMAGES.length > 2 ? "md:grid-cols-3" : ""
              }`}
            >
              {CAVIAR_IMAGES.slice(0, 3).map((img) => (
                <div
                  key={img.src}
                  className="aspect-[4/5] overflow-hidden rounded-lg border border-[color:var(--border-on-dark)] bg-white/[0.03]"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-12 flex justify-center">
            <a href="/shop">
              <GoldButton variant="cream">Shop the collection</GoldButton>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
