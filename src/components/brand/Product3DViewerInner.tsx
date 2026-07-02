import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { scene } = useGLTF(url);

  useFrame((_, delta) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Center>
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
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
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 0.18], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 3, 3]} intensity={2} />
        <directionalLight position={[-2, 1, -2]} intensity={0.8} color="#b8a070" />
        <pointLight position={[0, 2, 0]} intensity={0.6} color="#d4c4a0" />
        <Model url={url} />
        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
          minDistance={0.08}
          maxDistance={0.5}
        />
      </Canvas>
    </div>
  );
}

export default Product3DViewerInner;
