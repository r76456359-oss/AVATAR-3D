import React, { Suspense } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { rigAvatar } from '../utils/riggingUtils';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// FIX: Manually extending the JSX namespace to include all elements from @react-three/fiber.
// This resolves errors where TypeScript doesn't recognize R3F's custom JSX elements
// by merging R3F's `ThreeElements` interface with the global `JSX.IntrinsicElements`.
declare global {
  namespace JSX {
    // FIX: The `import()` type syntax is invalid in an `extends` clause. Using the imported
    // `ThreeElements` identifier directly to correctly merge @react-three/fiber types
    // into the global JSX namespace and resolve all related TypeScript errors.
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface AvatarCanvasProps {
  landmarks: PoseLandmarkerResult | null;
}

// Define Model component outside of AvatarCanvas to prevent re-creation on re-render
const Model: React.FC<{ landmarks: PoseLandmarkerResult | null }> = ({ landmarks }) => {
  const { scene } = useGLTF('https://models.readyplayer.me/667308709f3e496353d3b5b6.glb');

  useFrame(() => {
    if (landmarks && landmarks.worldLandmarks && landmarks.worldLandmarks.length > 0) {
      rigAvatar(landmarks, scene);
    }
  });

  return <primitive object={scene} scale={1} position={[0, -1.6, 0]} />;
};


const AvatarCanvas: React.FC<AvatarCanvasProps> = ({ landmarks }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 50 }}
      className="w-full h-full bg-gray-800"
      shadows
    >
      <ambientLight intensity={1.5} />
      <directionalLight 
        position={[3, 3, 5]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-3, 2, -5]} intensity={1.5} color="cyan"/>
      <pointLight position={[3, 2, -5]} intensity={1.5} color="magenta"/>
      
      <Suspense fallback={null}>
        <Model landmarks={landmarks} />
      </Suspense>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={2} 
        maxDistance={5} 
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
};

export default AvatarCanvas;