'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function Philosophy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!textRef.current) return;

      gsap.fromTo(
        textRef.current,
        {
          opacity: 0,
          y: 100,
          rotateX: -20,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.5,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24 lg:py-40">
      <div className="flex flex-col gap-12">
        <div className="flex items-center gap-4">
          <div className="h-px w-12 bg-red-500/50" />
          <span className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase">
            Engineering Vision
          </span>
        </div>

        <h2
          ref={textRef}
          className="font-display text-4xl leading-tight tracking-tight text-balance decoration-blue-500/30 underline-offset-8 md:text-6xl lg:text-7xl"
        >
          Mastering <span className="text-blue-500">complexity</span>, <br />
          architecting{' '}
          <span className="text-red-500 underline decoration-red-500/30">
            resilient
          </span>{' '}
          systems.
        </h2>

        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed md:text-xl">
          I don&apos;t just build features; I engineer scalable ecosystems. My
          blog is a laboratory for deep dives into distributed systems,
          low-level optimization, and the art of building software that survives
          the test of extreme scale.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: 'System Design',
              desc: 'Architecting for high availability and zero-downtime deployment cycles.',
            },
            {
              title: 'Performance',
              desc: 'Shaving microseconds from critical paths using low-level optimization.',
            },
            {
              title: 'Infrastructure',
              desc: 'Automating complex cloud environments with code-first reliability.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="glass group flex flex-col gap-4 rounded-2xl border-white/5 p-8 transition-colors hover:border-white/10"
            >
              <h3 className="font-ops text-sm text-xl font-semibold tracking-tight uppercase transition-colors group-hover:text-blue-400">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
