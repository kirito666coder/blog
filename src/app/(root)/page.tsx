'use client';
import { Navbar } from '@/components/navbar/Navbar';
import HeroSection from './HeroSection';
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
      <div
        id="smooth-content"
        className="bg-background text-foreground selection:bg-foreground selection:text-background min-h-screen"
      >
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <HeroSection />
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
