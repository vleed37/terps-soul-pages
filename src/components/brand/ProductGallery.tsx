import { useState } from "react";
import { Product3DViewer } from "./Product3DViewer";

interface Props {
  /** Approved photographs, best first. May be empty. */
  images: string[];
  name: string;
  /** Product line name, used for alt text and the honest placeholder. */
  lineName: string;
  /** Optional rotating 3D model, shown first when present. */
  modelUrl?: string | undefined;
}

/**
 * Compact product gallery. When a 3D model exists it leads as a slowly rotating
 * view; photographs follow. One view renders cleanly on its own; several render
 * with keyboard- and touch-operable thumbnails. When neither a model nor an
 * approved photograph exists we show a branded placeholder.
 */
export function ProductGallery({ images, name, lineName, modelUrl }: Props) {
  const views: Array<{ kind: "model" | "image"; src: string }> = [
    ...(modelUrl ? [{ kind: "model" as const, src: modelUrl }] : []),
    ...images.map((src) => ({ kind: "image" as const, src })),
  ];
  const [active, setActive] = useState(0);
  const current = views[active];

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
        {current.kind === "model" ? (
          <div
            role="img"
            aria-label={`Rotating 3D view of ${name} — ${lineName} by Terps`}
            className="aspect-[4/5] w-full"
          >
            <Product3DViewer url={current.src} className="h-full w-full" />
          </div>
        ) : (
          <img
            src={current.src}
            alt={`${name} — ${lineName} by Terps`}
            className="mx-auto aspect-[4/5] w-full object-contain p-6"
          />
        )}
      </div>

      {views.length > 1 && (
        <div role="group" aria-label={`${name} views`} className="mt-4 flex flex-wrap gap-3">
          {views.map((v, i) => (
            <button
              key={`${v.kind}-${v.src}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={
                v.kind === "model"
                  ? `Show the rotating 3D view of ${name}`
                  : `Show image ${i + 1} of ${views.length} of ${name}`
              }
              aria-current={i === active}
              className={`h-20 w-20 overflow-hidden rounded-[4px] border transition-colors ${
                i === active
                  ? "border-[color:var(--accent-gold)]"
                  : "border-[color:var(--border-subtle)] hover:border-[color:var(--border-strong)]"
              }`}
            >
              {v.kind === "model" ? (
                <span className="flex h-full w-full items-center justify-center bg-[color:var(--bg-elevated)] text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-gold)]">
                  3D
                </span>
              ) : (
                <img src={v.src} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
