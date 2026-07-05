'use client';

import { gsap } from '@/lib/gsap';
import { useEffect, useRef } from 'react';

export function JourneyTimeline() {
  const timelineNodesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(timelineNodesRef.current, {
        x: -50,
        opacity: 0,
        duration: 1,
        stagger: 0.25,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: timelineNodesRef.current[0],
          start: 'top 85%',
        },
      });

      timelineNodesRef.current.forEach((node) => {
        const dot = node?.querySelector('.timeline-dot');
        if (dot) {
          gsap.to(dot, {
            scale: 1.3,
            boxShadow: '0 0 20px rgba(255,255,255,0.8)',
            backgroundColor: 'var(--foreground)',
            duration: 0.4,
            scrollTrigger: {
              trigger: node,
              start: 'top 60%',
              end: 'bottom 40%',
              toggleActions: 'play reverse play reverse',
            },
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);
  return (
    <section className="bg-background border-border/10 relative w-full border-t px-6 py-24 md:px-20 lg:px-40">
      <div className="mb-16 flex flex-col items-center justify-between gap-8 md:flex-row">
        <h2 className="font-display text-5xl md:text-7xl">
          The{' '}
          <span className="text-transparent [-webkit-text-stroke:2px_var(--foreground)]">
            Journey
          </span>
        </h2>
        <p className="text-foreground/60 max-w-md text-lg">
          A chronological timeline of my professional experience, continuous
          learning, and major milestones.
        </p>
      </div>

      <div className="border-border/30 relative ml-4 space-y-16 border-l pl-8 md:ml-6 md:pl-12">
        <div
          ref={(el) => {
            timelineNodesRef.current[0] = el;
          }}
          className="relative"
        >
          <div className="timeline-dot bg-foreground border-background absolute top-1.5 -left-[2.85rem] h-6 w-6 rounded-full border-4 shadow-[0_0_15px_rgba(255,255,255,0.5)] md:-left-[3.85rem]" />
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <span className="font-ops text-2xl tracking-widest md:text-3xl">
              2024 — PRESENT
            </span>
            <span className="text-foreground/40 hidden md:inline">•</span>
            <span className="text-xl font-medium">Lorem Ipsum Title</span>
          </div>
          <h3 className="text-foreground/80 mb-4 text-xl">
            Lorem Company Name
          </h3>
          <p className="text-foreground/60 max-w-2xl leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam.
          </p>
        </div>

        <div
          ref={(el) => {
            timelineNodesRef.current[1] = el;
          }}
          className="relative"
        >
          <div className="timeline-dot bg-foreground/50 border-background absolute top-1.5 -left-[2.85rem] h-6 w-6 rounded-full border-4 md:-left-[3.85rem]" />
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <span className="font-ops text-foreground/70 text-2xl tracking-widest md:text-3xl">
              2022 — 2024
            </span>
            <span className="text-foreground/40 hidden md:inline">•</span>
            <span className="text-xl font-medium">Lorem Ipsum Position</span>
          </div>
          <h3 className="text-foreground/80 mb-4 text-xl">Ipsum Studio</h3>
          <p className="text-foreground/60 max-w-2xl leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis
            aute irure dolor in reprehenderit.
          </p>
        </div>

        <div
          ref={(el) => {
            timelineNodesRef.current[2] = el;
          }}
          className="relative"
        >
          <div className="timeline-dot bg-foreground/20 border-background absolute top-1.5 -left-[2.85rem] h-6 w-6 rounded-full border-4 md:-left-[3.85rem]" />
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <span className="font-ops text-foreground/50 text-2xl tracking-widest md:text-3xl">
              2020 — 2022
            </span>
            <span className="text-foreground/40 hidden md:inline">•</span>
            <span className="text-xl font-medium">Dolor Sit Amet</span>
          </div>
          <h3 className="text-foreground/80 mb-4 text-xl">
            Placeholder Organization
          </h3>
          <p className="text-foreground/60 max-w-2xl leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur
            sint occaecat cupidatat non proident, sunt in culpa qui officia
            deserunt.
          </p>
        </div>
      </div>
    </section>
  );
}
