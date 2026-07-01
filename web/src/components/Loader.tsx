'use client';

import { useAppStore } from '@/store/app-store';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

interface IntroLoaderProps {
  visible: boolean;
}

export function IntroLoader({ visible }: IntroLoaderProps) {
  const [progress, setProgress] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const maskGroupRef = useRef<SVGGElement>(null);
  const blackTextRef = useRef<SVGTextElement>(null);

  const { theme } = useAppStore();

  const isDark = theme === 'dark';

  // Loading Counter
  useEffect(() => {
    if (!visible) return;

    const obj = { value: 0 };

    const tween = gsap.to(obj, {
      value: 100,
      duration: 5,
      ease: 'none',
      onUpdate: () => {
        setProgress(Math.round(obj.value));
      },
    });

    return () => {
      tween.kill();
    };
  }, [visible]);

  // Reveal Animation (UNCHANGED STRUCTURE)
  useEffect(() => {
    if (visible) return;

    const tl = gsap.timeline();

    gsap.set(maskGroupRef.current, {
      scale: 1,
      svgOrigin: '50 50',
      transformOrigin: 'center center',
    });

    gsap.set(blackTextRef.current, {
      opacity: 1,
    });

    // Fade loading screen
    tl.to(loadingRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    });

    // Small pause (BLACK PHASE)
    tl.to({}, { duration: 2 });

    // 👉 SWITCH HERE (black → transparent)
    tl.to(blackTextRef.current, {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(2px)',
      transformOrigin: '50% 50%',
      duration: 1,
      ease: 'power3.Out',
    });

    // Expand transparent text (your original animation)
    tl.to(
      maskGroupRef.current,
      {
        xPercent: 3000,
        scale: 700,
        // svgOrigin: '50 50',
        duration: 2.5,
        ease: 'power4.inOut',
      },
      '<'
    );

    // Remove overlay
    tl.to(
      rootRef.current,
      {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      },
      '-=0.25'
    );

    tl.set(rootRef.current, {
      display: 'none',
    });

    return () => {
      tl.kill();
    };
  }, [visible]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[99999]">
      {/* SVG LAYER */}

      {isDark ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="kirito-mask">
              <rect x="0" y="0" width="100" height="100" fill="white" />

              <g ref={maskGroupRef}>
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  fontSize="16"
                  fontWeight="900"
                  style={{ fontFamily: 'var(--font-ops)' }}
                >
                  KIRITO
                </text>
              </g>
            </mask>
          </defs>

          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="white"
            mask="url(#kirito-mask)"
          />

          <text
            ref={blackTextRef}
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="black"
            fontSize="16"
            fontWeight="900"
            style={{ fontFamily: 'var(--font-ops)' }}
          >
            KIRITO
          </text>
        </svg>
      ) : (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="kirito-mask">
              <rect x="0" y="0" width="100" height="100" fill="white" />

              <g ref={maskGroupRef}>
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  fontSize="16"
                  fontWeight="900"
                  style={{ fontFamily: 'var(--font-ops)' }}
                >
                  KIRITO
                </text>
              </g>
            </mask>
          </defs>

          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="black"
            mask="url(#kirito-mask)"
          />

          <text
            ref={blackTextRef}
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="16"
            fontWeight="900"
            style={{ fontFamily: 'var(--font-ops)' }}
          >
            KIRITO
          </text>
        </svg>
      )}

      {/* Loading Screen */}
      <div
        ref={loadingRef}
        className="bg-background absolute inset-0 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="font-ops text-foreground text-[12vw] leading-none font-black">
            {progress}%
          </div>

          <div className="text-foreground/60 mt-4 text-xs tracking-[0.5em] uppercase">
            Loading
          </div>
        </div>
      </div>
    </div>
  );
}
