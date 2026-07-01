// components/route-reveal.tsx

'use client';

import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/app-store';

export function RouteReveal() {
  const revealOpen = useAppStore((s) => s.revealOpen);
  const revealName = useAppStore((s) => s.revealName);
  const revealX = useAppStore((s) => s.revealX);
  const stopReveal = useAppStore((s) => s.stopReveal);

  const rootRef = useRef<HTMLDivElement>(null);
  const maskGroupRef = useRef<SVGGElement>(null);
  const blackTextRef = useRef<SVGTextElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const { theme } = useAppStore();

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!revealOpen) return;

    // Kill any previous animation on the same elements
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    gsap.killTweensOf(maskGroupRef.current);
    gsap.killTweensOf(blackTextRef.current);
    gsap.killTweensOf(rootRef.current);

    // --- CRITICAL RESET ---
    // Remove any leftover transforms from previous animations
    gsap.set(maskGroupRef.current, {
      clearProps: 'transform', // nukes all previous transform-related styles
    });
    // Now set the clean starting state
    gsap.set(maskGroupRef.current, {
      scale: 1,
      xPercent: 0,
      svgOrigin: '50 50',
      transformOrigin: 'center center',
    });

    gsap.set(rootRef.current, {
      display: 'block',
      opacity: 1,
    });

    gsap.set(blackTextRef.current, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    });

    const tl = gsap.timeline({
      onComplete: () => {
        stopReveal();
        timelineRef.current = null;
      },
    });
    timelineRef.current = tl;

    tl.to({}, { duration: 2 });

    tl.to(blackTextRef.current, {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(2px)',
      transformOrigin: '50% 50%',
      duration: 1,
      ease: 'power3.out',
    });

    tl.to(
      maskGroupRef.current,
      {
        xPercent: revealX,
        scale: 700,
        duration: 2.5,
        ease: 'power4.inOut',
      },
      '<'
    );

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
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [revealOpen, revealX, stopReveal, revealName]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[99999]"
      style={{ display: 'none' }}
    >
      {isDark ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="global-route-mask">
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
                  style={{
                    fontFamily: 'var(--font-ops)',
                  }}
                >
                  {revealName}
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
            mask="url(#global-route-mask)"
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
            style={{
              fontFamily: 'var(--font-ops)',
            }}
          >
            {revealName}
          </text>
        </svg>
      ) : (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="global-route-mask">
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
                  style={{
                    fontFamily: 'var(--font-ops)',
                  }}
                >
                  {revealName}
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
            mask="url(#global-route-mask)"
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
            style={{
              fontFamily: 'var(--font-ops)',
            }}
          >
            {revealName}
          </text>
        </svg>
      )}
    </div>
  );
}
