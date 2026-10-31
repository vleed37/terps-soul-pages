import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { getModelStill } from "@/lib/model-stills";

const Product3DViewerInner = lazy(
  () => import("./Product3DViewerInner")
);

export function Product3DViewer({
  url,
  className = "",
  name = "Terps product",
  poster,
}: {
  url: string;
  className?: string;
  name?: string;
  poster?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const still = poster ?? getModelStill(url);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      const inView = entry?.isIntersecting ?? false;
      setVisible(inView);
      if (inView) setLoaded(true);
    });
    observer.observe(node);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => { observer.disconnect(); media.removeEventListener("change", update); };
  }, []);
  return (
    <div ref={ref} role="img" aria-label={`3D model of ${name}`} data-model-url={url} data-model-visible={visible} data-model-ready={ready} className={`relative ${className}`}>
      {still && !ready && <img src={still} alt={`Still of the ${name} 3D model`} loading="lazy" className="absolute inset-0 h-full w-full object-contain" />}
      {loaded && <Suspense fallback={null}>
        <Product3DViewerInner url={url} active={visible && !reducedMotion} onReady={() => setReady(true)} className="absolute inset-0 h-full w-full" />
      </Suspense>}
    </div>
  );
}
