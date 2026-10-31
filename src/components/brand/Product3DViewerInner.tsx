import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Center, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

function Model({ url, active, onReady }: { url: string; active: boolean; onReady: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const gl = useThree((s) => s.gl);

  // Clone once, and sharpen textures (anisotropy + correct color space).
  const model = useMemo(() => scene.clone(true), [scene]);
  const scale = useMemo(() => {
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    return 1.6 / Math.max(size.y, size.x, size.z, 0.001);
  }, [model]);
  const notified = useRef(false);

  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) {
        const m = mat as THREE.MeshStandardMaterial;
        for (const key of ["map", "emissiveMap", "roughnessMap", "metalnessMap", "normalMap", "aoMap"] as const) {
          const tex = m[key] as THREE.Texture | null | undefined;
          if (!tex) continue;
          tex.anisotropy = maxAniso;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          if (key === "map" || key === "emissiveMap") tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
        }
        m.needsUpdate = true;
      }
    });
  }, [model, gl]);

  useFrame((_, delta) => {
    if (!notified.current) { notified.current = true; onReady(); }
    if (groupRef.current && active) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Center>
      <group ref={groupRef} scale={scale}>
        <primitive object={model} />
      </group>
    </Center>
  );
}

export function Product3DViewerInner({
  url,
  className = "",
  active,
  onReady,
}: {
  url: string;
  className?: string;
  active: boolean;
  onReady: () => void;
}) {
  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <Canvas
        frameloop={active ? "always" : "demand"}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.25], fov: 35 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ pointerEvents: "none", touchAction: "auto" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.6} />
        <directionalLight position={[-2, 1, -2]} intensity={0.6} color="#b8a070" />
        <Environment resolution={256}>
          <Lightformer intensity={2.4} position={[0, 3, 2]} scale={[8, 8, 1]} />
          <Lightformer
            intensity={1.2}
            color="#d4c4a0"
            position={[-4, 1, 1]}
            rotation-y={Math.PI / 2}
            scale={[10, 4, 1]}
          />
          <Lightformer
            intensity={1}
            color="#ffffff"
            position={[4, 1, -1]}
            rotation-y={-Math.PI / 2}
            scale={[10, 4, 1]}
          />
        </Environment>
        <Model url={url} active={active} onReady={onReady} />
      </Canvas>
    </div>
  );
}

export default Product3DViewerInner;
