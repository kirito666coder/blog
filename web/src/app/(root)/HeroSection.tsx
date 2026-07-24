'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/all';
import Link from 'next/link';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 2;
        const y = (clientY / window.innerHeight - 0.5) * 2;

        gsap.to('.parallax-item-1', {
          x: x * 60,
          y: y * 60,
          duration: 1.5,
          ease: 'power2.out',
        });

        gsap.to('.parallax-item-2', {
          x: x * -80,
          y: y * -80,
          duration: 1.5,
          ease: 'power2.out',
        });

        gsap.to('.parallax-item-3', {
          x: x * 40,
          y: y * -40,
          duration: 1.5,
          ease: 'power2.out',
        });

        gsap.to('.parallax-item-4', {
          x: x * -50,
          y: y * 50,
          duration: 1.5,
          ease: 'power2.out',
        });
      };

      window.addEventListener('mousemove', handleMouseMove);

      const titleSplit = SplitText.create(titleRef.current, {
        type: 'chars, words',
      });

      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        titleSplit.chars,
        {
          opacity: 0,
          y: 100,
          rotateZ: 15,
          scale: 0.5,
        },
        {
          opacity: 1,
          y: 0,
          rotateZ: 0,
          scale: 1,
          stagger: 0.03,
          ease: 'back.out(1.5)',
          duration: 0.8,
        }
      );

      tl.fromTo(
        '.fade-up',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
        '-=0.4'
      );

      tl.fromTo(
        '.floating-badge',
        { opacity: 0, scale: 0, rotate: -20 },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'back.out(1.5)',
        },
        '-=0.6'
      );

      gsap.to('.marquee-content', {
        xPercent: -50,
        ease: 'none',
        duration: 25,
        repeat: -1,
      });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="bg-background relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="floating-badge parallax-item-1 border-border/50 bg-foreground/5 absolute top-[20%] left-[10%] rotate-[-8deg] rounded-full border px-6 py-3 backdrop-blur-xl md:left-[15%]">
          <span className="text-foreground text-sm font-black tracking-widest uppercase">
            Frontend Architecture
          </span>
        </div>

        <div className="floating-badge parallax-item-2 border-border/50 bg-foreground/5 absolute top-[30%] right-[10%] rotate-[6deg] rounded-full border px-6 py-3 backdrop-blur-xl md:right-[15%]">
          <span className="text-foreground text-sm font-black tracking-widest uppercase">
            System Design
          </span>
        </div>

        <div className="floating-badge parallax-item-3 border-border/50 bg-foreground/5 absolute bottom-[35%] left-[5%] rotate-[12deg] rounded-full border px-6 py-3 backdrop-blur-xl md:left-[12%]">
          <span className="text-foreground text-sm font-black tracking-widest uppercase">
            Microservices
          </span>
        </div>

        <div className="floating-badge parallax-item-4 border-border/50 bg-foreground/5 absolute right-[5%] bottom-[25%] rotate-[-10deg] rounded-full border px-6 py-3 backdrop-blur-xl md:right-[20%]">
          <span className="text-foreground text-sm font-black tracking-widest uppercase">
            Performance Tuning
          </span>
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
        <div className="fade-up border-border/50 bg-foreground/5 mb-6 inline-flex items-center gap-3 rounded-full border px-5 py-2 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="bg-foreground absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-foreground relative inline-flex h-2.5 w-2.5 rounded-full" />
          </span>
          <span className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase">
            Kirito Blogs v1.0
          </span>
        </div>

        <h1
          ref={titleRef}
          className="font-ops mb-6 text-6xl font-black tracking-tighter uppercase md:text-8xl lg:text-9xl"
          style={{ perspective: '1000px' }}
        >
          <span className="text-foreground">CRAFTING</span> <br />
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: '2px var(--foreground)' }}
          >
            THE WEB
          </span>
        </h1>

        <p className="fade-up text-muted-foreground mb-10 max-w-2xl text-base leading-relaxed font-medium md:text-xl">
          Where clean code meets scalable architecture. I build digital
          experiences that are fast, accessible, and visually stunning.
        </p>

        <div className="fade-up flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/blogs"
            className="group bg-foreground text-background hover:shadow-foreground/20 relative flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 font-bold transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <span className="relative z-10 tracking-wider">EXPLORE BLOGS</span>
            <svg
              className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            <div className="bg-background/20 absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-0 z-0 flex w-full overflow-hidden opacity-10 select-none">
        <div
          className="marquee-content flex gap-8 text-[150px] leading-none font-black tracking-tighter whitespace-nowrap text-transparent uppercase"
          style={{ WebkitTextStroke: '2px var(--foreground)' }}
        >
          <span>INNOVATE • BUILD • SCALE • OPTIMIZE •</span>
          <span>INNOVATE • BUILD • SCALE • OPTIMIZE •</span>
        </div>
      </div>
    </section>
  );
}
