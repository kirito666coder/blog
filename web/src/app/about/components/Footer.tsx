'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // The text starts pushed down by 150% of its own height
      // and slides up to 0% exactly as the user scrolls to the bottom of the page
      gsap.fromTo(
        textRef.current,
        { y: '150%' },
        {
          y: '0%',
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom', // when the top of the footer enters the bottom of the screen
            end: 'bottom bottom', // when the footer is fully in view
            scrub: true, // ties the animation to the scrollbar
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={containerRef}
      className="bg-foreground text-background relative flex h-[70vh] w-full flex-col justify-between overflow-hidden px-6 pt-20 md:px-20 lg:px-40"
    >
      <div className="relative z-10 flex w-full flex-col items-start justify-between gap-10 md:flex-row md:items-end">
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-4xl md:text-5xl lg:text-6xl">
            Ready to <br /> collaborate?
          </h3>
          <p className="text-background/60 max-w-sm text-lg font-light">
            I'm currently available for freelance projects and exciting new
            opportunities.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:text-right">
          <div className="flex flex-col gap-2">
            <span className="text-background/40 text-sm tracking-widest uppercase">
              Socials
            </span>
            <div className="flex gap-6 text-lg font-medium">
              <a
                href="#"
                className="hover:text-background/70 transition-colors"
              >
                X / Twitter
              </a>
              <a
                href="#"
                className="hover:text-background/70 transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="hover:text-background/70 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-background/40 text-sm tracking-widest uppercase">
              Contact
            </span>
            <a
              href="mailto:hello@kirito.dev"
              className="hover:text-background/70 text-xl font-medium transition-colors"
            >
              hello@kirito.dev
            </a>
          </div>
        </div>
      </div>

      {/* Huge Animated Footer Text */}
      <div className="relative mt-auto flex w-full translate-y-[5%] justify-center overflow-hidden">
        <h1
          ref={textRef}
          className="font-display text-[22vw] leading-none tracking-tight will-change-transform"
        >
          KIRITO
        </h1>
      </div>
    </footer>
  );
}
