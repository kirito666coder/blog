'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Code2, Layers, Cpu, Globe } from 'lucide-react';
import Link from 'next/link';
import { CoreStackCard } from './components/CoreStackCard';

export default function BentoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '.bento-card',
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          },
        }
      );

      gsap.to('.tech-marquee-content', {
        xPercent: -50,
        ease: 'none',
        duration: 20,
        repeat: -1,
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="flex h-screen w-full flex-col items-center justify-center p-6 lg:p-12"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:auto-rows-[180px] md:grid-cols-4 md:gap-6 lg:auto-rows-[220px]">
        <div className="bento-card bg-foreground/5 border-border/50 group hover:border-foreground/30 hover:bg-foreground/10 relative flex flex-col justify-end overflow-hidden rounded-[2rem] border p-8 backdrop-blur-xl transition-all md:col-span-2 md:row-span-2">
          <div className="from-background/90 absolute inset-0 z-0 bg-gradient-to-t to-transparent" />
          <div className="relative z-10">
            <div className="border-border/50 bg-background/50 mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Available for work
              </span>
            </div>
            <h2 className="font-ops text-foreground mb-4 text-4xl font-black tracking-tighter uppercase lg:text-6xl">
              Kirito
              <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: '1px var(--foreground)' }}
              >
                The Coder
              </span>
            </h2>
            <p className="text-muted-foreground max-w-sm font-medium">
              A passionate full-stack engineer and designer dedicated to
              building immersive digital experiences.
            </p>
          </div>
        </div>

        <Link
          href="/blogs"
          className="bento-card bg-foreground/5 border-border/50 group hover:border-foreground/30 hover:bg-foreground/10 relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl transition-all md:col-span-2 md:row-span-1 lg:p-8"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-2xl font-bold tracking-tight uppercase">
              Recent Insights
            </h3>
            <div className="bg-foreground text-background transform rounded-full p-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowRight size={20} strokeWidth={3} />
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-3 font-medium">
              Dive into my latest thoughts on software architecture, design
              patterns, and web performance.
            </p>
            <div className="flex gap-2">
              <span className="border-border/50 bg-background/50 rounded-md border px-2 py-1 text-xs font-bold tracking-wider uppercase">
                React
              </span>
              <span className="border-border/50 bg-background/50 rounded-md border px-2 py-1 text-xs font-bold tracking-wider uppercase">
                Next.js
              </span>
            </div>
          </div>
        </Link>

        <CoreStackCard />

        <div className="bento-card grid grid-cols-2 grid-rows-2 gap-4 md:col-span-1 md:row-span-1">
          <a
            href="#"
            className="bg-foreground/5 border-border/50 hover:bg-foreground/10 hover:border-foreground/30 flex items-center justify-center rounded-[2rem] border backdrop-blur-xl transition-all hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.37 4.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
          <a
            href="#"
            className="bg-foreground/5 border-border/50 hover:bg-foreground/10 hover:border-foreground/30 flex items-center justify-center rounded-[2rem] border backdrop-blur-xl transition-all hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </a>
          <a
            href="#"
            className="bg-foreground/5 border-border/50 hover:bg-foreground/10 hover:border-foreground/30 flex items-center justify-center rounded-[2rem] border backdrop-blur-xl transition-all hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <div className="bg-foreground/5 border-border/50 flex items-center justify-center rounded-[2rem] border backdrop-blur-xl">
            <span className="font-ops text-2xl font-black uppercase">More</span>
          </div>
        </div>

        <div className="bento-card bg-foreground text-background border-border/50 group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl transition-all hover:scale-[1.02] md:col-span-1 md:row-span-1">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl leading-none font-black uppercase">
              Let&apos;s
              <br />
              Talk
            </h3>
            <p className="text-background/70 text-sm font-medium">
              Have a project in mind?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-background text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45">
              <ArrowRight size={20} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold tracking-wider uppercase">
              Get in touch
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
