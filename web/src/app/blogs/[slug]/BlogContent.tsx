'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface BlogContentProps {
  children: React.ReactNode;
}

export const BlogContent = ({ children }: BlogContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Animate children entry
      const childrenToAnimate = containerRef.current.children;
      gsap.from(childrenToAnimate, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="flex flex-col">
      {children}
    </div>
  );
};
