'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Model } from './MainModel';
import { Environment } from '@react-three/drei';
export default function Scene({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="h-full w-full">
      <Canvas shadows camera={{ position: [0, 1, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1} />

          <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
          <Model isHovered={isHovered} />

          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
