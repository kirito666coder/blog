'use client';

import { useEffect } from 'react';
import { ScrollSmoother } from '@/lib/gsap';
import BlogsContainer from './BlogsContainer';
import { Navbar } from '@/components/navbar/Navbar';

export default function BlogsPage() {
  useEffect(() => {
    if (!window) return;
    const smoother = ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });
    return () => {
      smoother.kill();
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div
        id="smooth-content"
        className="bg-background text-foreground selection:bg-foreground selection:text-background min-h-screen"
      >
        <Navbar />
        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-20 lg:py-32">
          <header className="flex max-w-4xl flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-blue-500/50" />
              <span className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase">
                The Knowledge Base
              </span>
            </div>

            <h1 className="font-display text-5xl leading-none tracking-tight md:text-7xl lg:text-8xl">
              Technical{' '}
              <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-8">
                Artifacts
              </span>
              .
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
              Sharing experiments, architectural patterns, and production-hardened lessons from the
              world of software engineering. No fluff, just code.
            </p>
          </header>

          <BlogsContainer />
        </div>

        <footer className="border-border/40 border-t px-6 py-20">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="font-ops text-2xl tracking-tighter">KIRITO.BLOG</div>
            <p className="text-muted-foreground/60 text-xs">
              © 2026 Kirito Blog. Built for the future.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
