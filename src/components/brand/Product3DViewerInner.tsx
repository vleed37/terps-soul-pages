import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center, Bounds } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={scene.clone()} />
      </group>
    </Center>
  );
}

export function Product3DViewerInner({
  url,
  className = "",
}: {
  url: string;
  className?: string;
}) {
  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: "none", touchAction: "auto" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 3, 3]} intensity={2} />
        <directionalLight position={[-2, 1, -2]} intensity={0.8} color="#b8a070" />
        <pointLight position={[0, 2, 0]} intensity={0.6} color="#d4c4a0" />
        <Bounds fit clip observe margin={1.15}>
          <Model url={url} />
        </Bounds>
      </Canvas>
    </div>
  );
}

export default Product3DViewerInner;
