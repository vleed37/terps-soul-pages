import { useState } from "react";

interface Props {
  /** Approved photographs, best first. May be empty. */
  images: string[];
  name: string;
  /** Product line name, used for alt text and the honest placeholder. */
  lineName: string;
}

/**
 * Compact product gallery. One image renders cleanly on its own; several render
 * with keyboard- and touch-operable thumbnails. When no approved photograph
 * exists we show a branded placeholder rather than a generated product image.
 */
export function ProductGallery({ images, name, lineName }: Props) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (!current) {
    return (
      <div
        role="img"
        aria-label={`Photography of ${name} is coming soon`}
        className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] text-center"
      >
        <span className="font-display text-4xl text-[color:var(--accent-gold)]">Terps</span>
        <span className="mt-3 px-8 text-xs uppercase tracking-[0.18em] text-[color:var(--text-tertiary)]">
          {lineName} photography coming soon
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg bg-[color:var(--bg-elevated)]">
        <img
          src={current}
          alt={`${name} — ${lineName} by Terps`}
          className="mx-auto aspect-[4/5] w-full object-contain p-6"
        />
      </div>

      {images.length > 1 && (
        <div
          role="group"
          aria-label={`${name} images`}
          className="mt-4 flex flex-wrap gap-3"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${images.length} of ${name}`}
              aria-current={i === active}
              className={`h-20 w-20 overflow-hidden rounded-[4px] border transition-colors ${
                i === active
                  ? "border-[color:var(--accent-gold)]"
                  : "border-[color:var(--border-subtle)] hover:border-[color:var(--border-strong)]"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
