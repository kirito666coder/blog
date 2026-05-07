'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type LoaderProps = {
  progress: number;
  isDone: boolean;
};

export default function Loader({ progress, isDone }: LoaderProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const whiteScreenRef = useRef<HTMLDivElement>(null);

  // Progress animation
  useEffect(() => {
    gsap.to(lineRef.current, {
      width: `${progress}%`,
      duration: 0.4,
      ease: 'power3.out',
    });
  }, [progress]);

  // Finish animation
  useEffect(() => {
    if (isDone) {
      const tl = gsap.timeline();

      // Expand line vertically
      tl.to(lineRef.current, {
        height: '100vh',
        duration: 0.6,
        ease: 'power4.inOut',
      });

      // Expand to full width
      tl.to(
        lineRef.current,
        {
          width: '100vw',
          duration: 0.8,
          ease: 'power4.inOut',
        },
        '<',
      );

      // Small delay
      tl.to({}, { duration: 0.6 });

      // Smooth fade out
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, [isDone]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
      {/* White Reveal Layer */}
      <div ref={whiteScreenRef} className="absolute inset-0 bg-white opacity-0" />

      {/* Center Line */}
      <div className="flex h-full items-center justify-center">
        <div className="w-screen">
          {/* Line */}
          <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/20">
            <div ref={lineRef} className="absolute top-0 left-0 h-full w-0 bg-white" />
          </div>

          {/* Percentage */}
          <div className="mt-3 flex justify-end">
            <p className="text-sm font-medium tracking-[0.2em] text-white">
              {Math.floor(progress)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
