'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { Model } from './MainModel';
import { Environment, useProgress } from '@react-three/drei';
import Loader from '../Loader';

function LoaderOverlay() {
  const { active, progress } = useProgress();

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  if (!visible) return null;

  return <Loader progress={progress} isDone={!active && progress === 100} />;
}

export default function Scene({ isHovered }: { isHovered: boolean | string }) {
  return (
    <div className="h-full w-full">
      <LoaderOverlay />
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
