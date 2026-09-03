import { ScrollReveal } from "./ScrollReveal";
import { MetaLabel } from "./MetaLabel";
import { Hairline } from "./Hairline";
import { GoldButton } from "./GoldButton";

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
      <div className="relative mx-auto max-w-[720px] text-center">
        <ScrollReveal>
          <MetaLabel gold>✦ Caviar Sticks</MetaLabel>
          <h2 className="mx-auto mt-6 max-w-[600px] font-display text-4xl leading-[1.05] tracking-[-0.01em] md:text-6xl">
            The only caviar stick you need.
          </h2>
          <p className="mt-5 font-display text-[1.5rem] italic text-[color:var(--text-secondary)] md:text-[1.75rem]">
            Cream of the crop.
          </p>
          <Hairline w="120px" className="mx-auto my-10" />
          <p className="mx-auto max-w-[580px] text-base leading-[1.65] text-[color:var(--text-secondary)] md:text-lg">
            [Caviar description — client to supply]
          </p>
          <div className="mt-10 flex justify-center">
            <a href="/shop">
              <GoldButton variant="cream">Shop the collection</GoldButton>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
