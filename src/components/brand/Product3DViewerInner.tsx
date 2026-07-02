import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { scene } = useGLTF(url);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    console.log("[3D DEBUG] Model bounding box size:", size.x, size.y, size.z);
  }, [scene]);

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
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="red" />
        </mesh>
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
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 3, 3]} intensity={2} />
        <directionalLight position={[-2, 1, -2]} intensity={0.8} color="#b8a070" />
        <pointLight position={[0, 2, 0]} intensity={0.6} color="#d4c4a0" />
        <Model url={url} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  );
}

export default Product3DViewerInner;
