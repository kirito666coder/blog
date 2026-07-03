'use client';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useEffect, useRef } from 'react';
import { MagneticButton } from './MagneticButton';

export function PremiumBentoGrid() {
  const bentoCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = bentoCardsRef.current.filter(
        (card): card is HTMLDivElement => card !== null
      );

      if (!cards.length) return;

      // Ensure cards are visible initially
      gsap.set(cards, {
        opacity: 1,
        y: 0,
      });

      // Simple animation
      cards.forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        });
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);
  return (
    <section className="bg-background relative z-40 flex w-full flex-col gap-24 overflow-hidden px-6 py-24 md:px-20 lg:px-40">
      {/* Background Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative flex flex-col items-start justify-between gap-16 md:flex-row">
        <h2 className="font-display w-full text-5xl leading-[1.1] tracking-tighter md:w-1/3 md:text-7xl lg:text-8xl">
          Crafting{' '}
          <span className="text-muted-foreground font-sans font-light italic">
            digital
          </span>{' '}
          realms.
        </h2>

        <div className="text-foreground/70 flex w-full flex-col gap-8 text-lg leading-relaxed font-light md:w-1/2 md:text-2xl">
          <p>
            I bridge the gap between exceptional design and robust engineering.
          </p>

          <p>
            Specializing in immersive, interactive and highly performant
            applications.
          </p>
        </div>
      </div>

      {/* BENTO GRID */}
      <div className="relative grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {/* CARD 1 */}
        <div
          ref={(el) => {
            bentoCardsRef.current[0] = el;
          }}
          className="from-border/40 to-border/10 border-border/50 group hover:border-foreground/30 relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-10 transition-all duration-500 md:col-span-2"
        >
          <div className="bg-foreground/5 absolute top-0 right-0 h-64 w-64 translate-x-1/4 -translate-y-1/2 rounded-full blur-3xl" />

          <h3 className="font-display relative z-10 mb-10 text-3xl md:text-5xl">
            Philosophy
          </h3>

          <p className="text-foreground/70 relative z-10 text-xl">
            Code is poetry. Design is the emotion it evokes.
          </p>
        </div>

        {/* CARD 2 */}
        <div
          ref={(el) => {
            bentoCardsRef.current[1] = el;
          }}
          className="bg-border/20 border-border/50 group hover:border-foreground/30 flex flex-col items-center justify-center rounded-3xl border p-8 text-center"
        >
          <h4 className="font-ops mb-4 text-4xl">Tech</h4>

          <p className="text-foreground/60">React, Next.js, GSAP, Tailwind</p>
        </div>

        {/* CARD 3 */}
        <div
          ref={(el) => {
            bentoCardsRef.current[2] = el;
          }}
          className="bg-border/20 border-border/50 group hover:border-foreground/30 flex flex-col items-center justify-center rounded-3xl border p-8 text-center"
        >
          <h4 className="font-ops mb-4 text-4xl">Design</h4>

          <p className="text-foreground/60">Figma, Motion, UI/UX</p>
        </div>

        {/* CARD 4 */}
        <div
          ref={(el) => {
            bentoCardsRef.current[3] = el;
          }}
          className="bg-foreground text-background relative flex flex-col items-center justify-between rounded-3xl p-10 md:col-span-2 md:flex-row"
        >
          <div>
            <h3 className="font-display mb-2 text-3xl md:text-5xl">
              Let&apos;s Connect
            </h3>

            <p className="text-background/70">
              Open for freelance opportunities.
            </p>
          </div>

          <MagneticButton className="bg-background text-foreground mt-8 rounded-full px-8 py-4 md:mt-0">
            Get in touch
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
