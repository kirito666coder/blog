'use client';

import type { BlogPost } from './data';
import { gsap } from '@/lib/gsap';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
}

const CATEGORY_BG = {
  React: 'bg-cyan-500/10 border-cyan-500/20',
  'Next.js': 'bg-white/10 border-white/20',
  Express: 'bg-green-500/10 border-green-500/20',
  DevOps: 'bg-fuchsia-500/10 border-fuchsia-500/20',
};

export default function BlogCard({ post, onClick }: BlogCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        rotateX: 10,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 95%',
        },
      });
    },
    { scope: cardRef },
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    gsap.to(card, {
      rotateY: x * 10,
      rotateX: -y * 10,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="glass group relative cursor-pointer overflow-hidden rounded-[2rem] border-white/5 p-8 ring-blue-500/50 transition-colors outline-none [perspective:1000px] hover:border-white/10 hover:bg-white/[0.05] focus:ring-2"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div
            className={`rounded-full border px-4 py-1 text-[10px] font-bold tracking-widest uppercase ${CATEGORY_BG[post.category]}`}
          >
            {post.category}
          </div>
          <span className="text-muted-foreground text-[10px] tracking-widest uppercase">
            {post.date}
          </span>
        </div>

        <h3 className="font-display text-2xl tracking-tight transition-colors group-hover:text-white">
          {post.title}
        </h3>

        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{post.excerpt}</p>

        <div className="flex items-center gap-2 pt-4">
          <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">
            Read Deep Dive
          </span>
          <div className="h-px w-8 bg-blue-500 transition-all group-hover:w-12" />
        </div>
      </div>

      {/* Decorative accent */}
      <div
        className={`absolute -top-4 -right-4 h-24 w-24 opacity-20 blur-[60px] transition-opacity group-hover:opacity-40 ${CATEGORY_BG[post.category].split(' ')[0]}`}
      />
    </div>
  );
}
