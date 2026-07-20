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
  return (
    <Link
      href={`blogs/${slug}`}
      className="group mt-25 block perspective-[1200px]"
    >
      <div
        className="glass premium-shadow border-foreground/20 relative flex flex-col gap-4 overflow-hidden border-b pb-5"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
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
