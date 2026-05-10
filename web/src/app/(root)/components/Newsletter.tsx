'use client';

import CutCornerButton from '@/components/CutCornerButton';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function Newsletter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24">
      <div className="glass relative flex flex-col items-center gap-8 overflow-hidden rounded-[2rem] border-white/5 p-8 text-center md:p-16 lg:p-24">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-red-500/10 blur-[100px]" />

        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-blue-500" />
          <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
            The Technical Lab Notes
          </span>
          <div className="h-px w-8 bg-blue-500" />
        </div>

        <h2 className="font-display max-w-3xl text-4xl tracking-tight md:text-5xl lg:text-6xl">
          Deep dives into <span className="text-white">infrastructure</span> and{' '}
          <span className="text-white">low-level</span> engineering.
        </h2>

        <p className="text-muted-foreground max-w-xl text-lg">
          Join my personal mailing list for exclusive technical breakthroughs,
          system design breakdowns, and the stuff that&apos;s too complex for a
          standard blog post.
        </p>

        <form
          className="mt-4 flex w-full max-w-xl flex-col gap-4 md:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="group relative flex-1">
            <input
              type="email"
              placeholder="Your engineering email"
              className="font-ops w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm transition-all outline-none focus:border-blue-500/50 focus:bg-white/10"
            />
            <div className="absolute bottom-0 left-0 h-px w-0 bg-blue-500 transition-all duration-500 group-focus-within:w-full" />
          </div>
          <div className="flex justify-center">
            <CutCornerButton text="JOIN THE LAB" url="#subscribe" />
          </div>
        </form>

        <p className="text-muted-foreground/50 text-[10px] tracking-widest uppercase">
          Read by senior engineers at top tech companies
        </p>
      </div>
    </section>
  );
}
