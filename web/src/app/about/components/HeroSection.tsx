'use client';
import { gsap } from '@/lib/gsap';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { MagneticButton } from './MagneticButton';

export default function HeroSection() {
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Load Reveal (Hero)
      gsap.from(heroTextRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.2,
      });

      gsap.from(heroImageRef.current, {
        scale: 1.1,
        opacity: 0,
        duration: 2,
        ease: 'power3.out',
        delay: 0.4,
      });

      // 2. Mouse Parallax (Hero)
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const xPos = (e.clientX / innerWidth - 0.5) * 2;
        const yPos = (e.clientY / innerHeight - 0.5) * 2;

        gsap.to(heroBgRef.current, {
          x: xPos * 40,
          y: yPos * 40,
          duration: 1,
          ease: 'power2.out',
        });

        gsap.to(heroImageRef.current, {
          x: xPos * -20,
          y: yPos * -20,
          duration: 1,
          ease: 'power2.out',
        });
      };
      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background Grid Pattern & Giant Typography */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05]">
        <h1 className="font-display text-[20vw] leading-none whitespace-nowrap">
          ABOUT ME
        </h1>
      </div>

      {/* Central Content Container */}
      <div className="relative z-10 flex h-full w-full max-w-screen-2xl flex-col items-center justify-between px-6 pt-24 md:flex-row md:px-12 md:pt-0">
        {/* Left: Text & Info */}
        <div className="relative z-20 flex w-full flex-col items-start md:w-1/2">
          <div className="mb-6 flex items-center gap-4">
            <span className="bg-foreground/50 h-px w-12" />
            <span className="text-foreground/70 text-sm font-medium tracking-[0.3em] uppercase">
              Introduction
            </span>
          </div>

          <h2
            ref={heroTextRef}
            className="font-display mb-8 text-6xl leading-[0.9] tracking-tighter sm:text-8xl lg:text-[7rem]"
          >
            Creative <br />
            <span className="text-transparent [-webkit-text-stroke:2px_var(--foreground)]">
              Developer
            </span>
          </h2>

          <p className="text-foreground/70 mb-10 max-w-md text-lg leading-relaxed font-light md:text-xl">
            Merging cutting-edge engineering with bold, experimental aesthetics
            to build unforgettable digital experiences.
          </p>

          <div className="flex gap-4">
            <MagneticButton
              href="#connect"
              className="border-foreground/20 bg-foreground/5 text-foreground hover:bg-foreground hover:text-background rounded-full border px-8 py-4 text-sm tracking-widest uppercase backdrop-blur-md"
            >
              Explore Work
            </MagneticButton>
          </div>
        </div>

        {/* Right: Character Image with Geometric Backdrop */}
        <div
          ref={heroBgRef}
          className="relative z-10 mt-16 flex h-[60vh] w-full items-end justify-center md:mt-0 md:h-[85vh] md:w-1/2"
        >
          {/* Geometric accents */}
          <div className="border-foreground/10 absolute top-1/2 left-1/2 h-[70vw] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full border md:h-[40vw] md:w-[40vw]" />
          <div className="border-foreground/20 absolute top-1/2 left-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 animate-[spin_60s_linear_infinite] rounded-full border border-dashed md:h-[30vw] md:w-[30vw]" />

          {/* The Image */}
          <div ref={heroImageRef} className="relative z-20 h-full w-full">
            <Image
              src="/images/Doma.png"
              alt="Kirito"
              fill
              className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-transform duration-[2000ms] hover:scale-105 dark:drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
              priority
            />
          </div>
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="border-foreground/40 absolute top-6 left-6 h-4 w-4 border-t-2 border-l-2 md:top-10 md:left-10" />
      <div className="border-foreground/40 absolute top-6 right-6 h-4 w-4 border-t-2 border-r-2 md:top-10 md:right-10" />
      <div className="border-foreground/40 absolute bottom-6 left-6 h-4 w-4 border-b-2 border-l-2 md:bottom-10 md:left-10" />
      <div className="border-foreground/40 absolute right-6 bottom-6 h-4 w-4 border-r-2 border-b-2 md:right-10 md:bottom-10" />
    </section>
  );
}
