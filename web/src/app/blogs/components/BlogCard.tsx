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
    console.log(excerpt);
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;

      gsap.to(card, {
        rotateY: (x - 0.5) * 10,
        rotateX: (y - 0.5) * -10,
        duration: 0.5,
        ease: 'power2.out',
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: (x - 0.5) * width * 1.5,
          y: (y - 0.5) * height * 1.5,
          opacity: 0.15,
          duration: 0.5,
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0,
          duration: 0.5,
        });
      }
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Link href={`blogs/${slug}`} className="group perspective-1000 block">
      <div
        ref={cardRef}
        className="glass premium-shadow relative flex flex-col gap-4 overflow-hidden rounded-2xl border-r border-b p-6 transition-colors hover:border-white"
      >
        {/* Animated Glow Effect */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 blur-[100px]"
        />

        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
            {category}
          </span>
          <span className="text-muted-foreground text-[10px] tracking-widest uppercase">
            5 min read
          </span>
        </div>

        <h3 className="mt-2 text-xl font-bold transition-colors group-hover:text-white">
          {title}
        </h3>

        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {excerpt}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-muted-foreground rounded border border-white/5 bg-white/5 px-2 py-0.5"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white/50 transition-colors group-hover:text-white">
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
