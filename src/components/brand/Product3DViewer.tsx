import { Suspense, lazy } from "react";

const Product3DViewerInner = lazy(
  () => import("./Product3DViewerInner")
);

export function Product3DViewer({
  url,
  className = "",
}: {
  url: string;
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        <div
          className={`flex items-center justify-center ${className}`}
        >
          <span className="meta-xs text-[color:var(--text-tertiary)]">
            Loading 3D&hellip;
          </span>
        </div>
      }
    >
      <Product3DViewerInner url={url} className={className} />
    </Suspense>
  );
}
