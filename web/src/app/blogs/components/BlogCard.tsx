'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

interface BlogCardProps {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  tags: string[];
}

export const BlogCard = ({
  title,
  slug,
  category,
  excerpt,
  tags,
}: BlogCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;

    const glow = glowRef.current;

    if (!card || !glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;

      const y = e.clientY - rect.top;

      const rotateX = (y / rect.height - 0.5) * -10;

      const rotateY = (x / rect.width - 0.5) * 10;

      // Card tilt
      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
      });

      // Glow follows mouse exactly
      gsap.to(glow, {
        x,
        y,
        duration: 0.25,
        ease: 'power3.out',
      });
    };

    const handleMouseEnter = () => {
      gsap.to(glow, {
        opacity: 0.12,
        scale: 1,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.to(glow, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);

    card.addEventListener('mouseenter', handleMouseEnter);

    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);

      card.removeEventListener('mouseenter', handleMouseEnter);

      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Link href={`blogs/${slug}`} className="group block perspective-[1200px]">
      <div
        ref={cardRef}
        className="glass premium-shadow hover:border-foreground relative flex flex-col gap-4 overflow-hidden rounded-2xl border-r border-b p-6 transition-colors will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Moving Glow Ball */}
        <div
          ref={glowRef}
          className="bg-foreground pointer-events-none absolute top-0 left-0 z-0 h-40 w-40 rounded-full opacity-0"
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <span className="bg-foreground text-background rounded-full px-3 py-1 text-xs font-medium">
            {category}
          </span>

          <span className="text-muted-foreground text-[10px] tracking-widest uppercase">
            5 min read
          </span>
        </div>

        <h3 className="group-hover:text-foreground relative z-10 mt-2 text-xl font-bold transition-colors">
          {title}
        </h3>

        <p className="text-muted-foreground relative z-10 line-clamp-3 text-sm leading-relaxed">
          {excerpt}
        </p>

        <div className="relative z-10 mt-4 flex flex-wrap gap-2 font-mono text-[10px]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-foreground border-foreground bg-background rounded border px-2 py-0.5"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="text-foreground relative z-10 mt-6 flex items-center gap-2 text-xs font-bold opacity-50 transition-colors group-hover:opacity-100">
          READ MORE
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
