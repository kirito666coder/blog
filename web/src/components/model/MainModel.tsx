'use client';

import { useGLTF, useTexture } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import { useMemo } from 'react';
import type * as THREE from 'three';

type GLTFResult = {
  nodes: {
    [key: string]: THREE.Mesh;
  };
};

type ModelProps = {
  isHovered: boolean | string;
};

export function Model({ isHovered }: ModelProps) {
  const { nodes } = useGLTF('/model/MainStudio.glb') as unknown as GLTFResult;

  const texture1 = useTexture('/textures/MainStudio2.webp');
  const texture2 = useTexture('/textures/MainStudio.webp');

  const preparedTexture1 = useMemo(() => {
    const tex = texture1.clone();
    tex.flipY = false;
    tex.needsUpdate = true;
    return tex;
  }, [texture1]);

  const preparedTexture2 = useMemo(() => {
    const tex = texture2.clone();
    tex.flipY = false;
    tex.needsUpdate = true;
    return tex;
  }, [texture2]);

  const activeTexture = isHovered ? preparedTexture2 : preparedTexture1;

  const material = useMemo(() => {
    const mat = (
      nodes.Environment.material as THREE.MeshStandardMaterial
    ).clone();
    mat.map = activeTexture;
    mat.needsUpdate = true;
    return mat;
  }, [nodes, activeTexture]);

  // Smooth spring animation

  const { scale, position, rotation } = useSpring({
    scale: isHovered ? 1.12 : 1,
    position:
      isHovered === 'mainText'
        ? ([-1.25, -0.2, 1.9] as [number, number, number])
        : isHovered
          ? ([-1.2, 0.7, 1.9] as [number, number, number])
          : ([-0.7, 0.4, 1.9] as [number, number, number]),
    rotation: isHovered
      ? ([-0.8, -1.5, -1.6] as [number, number, number])
      : ([-0.5, -1.5, -1.6] as [number, number, number]),
    config: {
      mass: 1,
      tension: 280,
      friction: 18,
    },
  });

  return (
    <a.group
      scale={scale}
      position={position as unknown as [number, number, number]}
      rotation={rotation as unknown as [number, number, number]}
    >
      <mesh
        receiveShadow
        geometry={nodes.Environment.geometry}
        material={material}
      />
    </a.group>
  );
}

useGLTF.preload('/model/MainStudio.glb');
