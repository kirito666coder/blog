'use client';
import HeroSection from './HeroSection';
import Philosophy from './components/Philosophy';
import Newsletter from './components/Newsletter';
import { useEffect } from 'react';
import { ScrollSmoother } from '@/lib/gsap';
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
        <main className="mx-[12vw] w-[88vw] px-6 py-20 lg:py-32">
          <HeroSection />
          <Philosophy />
          <Newsletter />
        </main>

        <footer className="border-border/40 border-t px-6 py-20">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="font-ops text-2xl tracking-tighter">KIRITO.BLOG</div>
            <div className="text-muted-foreground flex gap-12 text-sm">
              <a
                href="#"
                className="hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="hover:text-foreground underline underline-offset-4 transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="hover:text-foreground underline underline-offset-4 transition-colors"
              >
                LinkedIn
              </a>
            </div>
            <p className="text-muted-foreground/60 text-xs">
              © 2026 Kirito Blog. Built for the future.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
