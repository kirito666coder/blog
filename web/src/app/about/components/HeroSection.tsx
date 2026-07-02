'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageRef.current) return;

    const xTo = gsap.quickTo(imageRef.current, 'x', {
      duration: 0.8,
      ease: 'power3.out',
    });

    const yTo = gsap.quickTo(imageRef.current, 'y', {
      duration: 0.8,
      ease: 'power3.out',
    });

    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      xTo(-x);
      yTo(-y);
    };

    window.addEventListener('mousemove', move);

    return () => {
      window.removeEventListener('mousemove', move);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 md:px-12 lg:px-24"
    >
      {/* background glow */}

      <div className="absolute top-0 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[180px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* left content */}

        <div>
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-xl">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

            <span className="text-sm text-white/70">
              Available for projects
            </span>
          </div>

          <h1 className="text-[clamp(4rem,10vw,8rem)] leading-[0.9] font-bold tracking-[-0.05em]">
            Creative
            <span className="block bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Developer
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/60">
            Building immersive digital experiences through modern design
            systems, motion, and engineering.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <button className="group relative overflow-hidden rounded-full bg-white px-8 py-5 font-medium text-black">
              <span className="relative z-10">Start Project</span>

              <div className="absolute inset-0 translate-y-full bg-black transition-all duration-500 group-hover:translate-y-0" />
            </button>

            <button className="rounded-full border border-white/10 bg-white/[0.02] px-8 py-5 backdrop-blur-xl">
              View Work
            </button>
          </div>
        </div>

        {/* right side */}

        <div className="relative flex justify-center">
          <div className="absolute h-[500px] w-[500px] rounded-full bg-gradient-to-r from-white/10 to-transparent blur-[120px]" />

          <div
            ref={imageRef}
            className="relative z-10 h-[700px] w-full max-w-[500px]"
          >
            <div className="absolute inset-0 rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-xl" />

            <Image
              src="/images/Doma.png"
              alt="Profile"
              fill
              priority
              className="object-contain drop-shadow-[0_30px_70px_rgba(255,255,255,.15)]"
            />
          </div>

          <div className="absolute -right-5 bottom-10 rounded-[30px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-400" />

              <span>Available now</span>
            </div>

            <p className="text-sm text-white/60">Next.js • GSAP • UI/UX</p>
          </div>
        </div>
      </div>
    </section>
  );
}
