'use client';
import { useEffect } from 'react';
import { ScrollSmoother } from '@/lib/gsap';
import Link from 'next/link';
import { DisplacementSphere } from '@/components/model/displacement-sphere';
import { ThemeToggleButton } from '@/components/Theme';
export default function Home() {
  useEffect(() => {
    if (!window) return;
    const smoother = ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });
    return () => {
      smoother.kill();
    };
  });

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content" className="min-h-screen">
        <main className="relative h-screen">
          <div className="absolute h-screen w-screen">
            <DisplacementSphere />
          </div>
          <div className="px-6 py-20 lg:py-32">
            <div className={`absolute`}>
              <Link
                href="/"
                className="font-ops text-6xl tracking-tighter transition-opacity"
              >
                KIRITO
                <div className="leading-7">BLOG</div>
              </Link>
              <div className="mt-8 ml-2 flex items-center gap-5">
                <Link href="/blogs">Blogs</Link>
                <Link href="/about">About</Link>
                <ThemeToggleButton />
              </div>
            </div>
            <h1 className={`absolute bottom-0`}>
              <div className="text-2xl leading-20">MUSIC VIDEO 2023</div>
              <div className="font-ops text-7xl leading-9 uppercase md:text-8xl md:leading-12 lg:text-9xl">
                ticking
              </div>
              <div className="font-ops text-7xl uppercase md:text-8xl lg:text-9xl">
                Away
              </div>
            </h1>
          </div>
        </main>
      </div>
    </div>
  );
}
