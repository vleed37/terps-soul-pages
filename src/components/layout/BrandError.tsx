import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { GoldButton } from "@/components/brand/GoldButton";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";

export function BrandError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("[BrandError]", error);
  }, [error]);
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[800px] flex-col items-center justify-center px-6 py-24 text-center md:px-12 md:py-32">
      <MetaLabel gold>✦ Error</MetaLabel>
      <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
        Something went <em className="text-[color:var(--accent-gold)]">off-script.</em>
      </h1>
      <Hairline w="120px" className="my-8" />
      <p className="mx-auto max-w-md text-base text-[color:var(--text-secondary)] md:text-lg">
        We've logged the issue. Try refreshing — or head back home.
      </p>
      <div className="mt-12">
        <GoldButton
          onClick={() => {
            router.invalidate();
            reset();
            router.navigate({ to: "/" });
          }}
        >
          Return home
        </GoldButton>
      </div>
    </div>
  );
}