'use client';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/all';
import { useRef } from 'react';
export default function HeroSection() {
  const titleRef = useRef<null | HTMLDivElement>(null);
  const shuffleTextRef = useRef<null | HTMLDivElement>(null);
  useGSAP(() => {
    const title = SplitText.create(titleRef.current, {
      type: 'chars',
    });
    const shuffleText = SplitText.create(shuffleTextRef.current, {
      type: 'chars',
    });
    const chars = shuffleText.chars as HTMLElement[];

    chars.forEach((el) => {
      el.dataset.final = el.textContent || '';
    });

    const randomChar = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      return chars[Math.floor(Math.random() * chars.length)];
    };

    const tl = gsap.timeline({ delay: 1 });

    chars.forEach((el, i) => {
      tl.fromTo(
        el,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.03,
          repeat: 8,
          onUpdate: () => {
            el.textContent = randomChar();
          },
          onComplete: () => {
            el.textContent = el.dataset.final || '';
          },
        },
        i * 0.09,
      );
    });
    tl.fromTo(
      title.chars,
      {
        y: 100,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        ease: 'power1.out',
        stagger: 0.02,
      },
    );
  });
  return (
    <header className="mb-16 flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <div className="bg-foreground/20 h-px w-12" />
          <span
            ref={shuffleTextRef}
            className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase"
          >
            Welcome to <span className="text-white">Kirito</span> Blog
          </span>
        </div>
        <div ref={titleRef}>
          <h1 className="font-display text-center text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
            A personal space for <span className="text-red-500">development</span> <br />
            and <span className="text-blue-500">system design</span>
          </h1>
        </div>
      </div>
    </header>
  );
}
