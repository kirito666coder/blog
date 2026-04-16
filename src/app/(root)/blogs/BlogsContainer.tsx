'use client';

import { useState, useRef, useMemo } from 'react';
import type { BlogPost } from './data';
import { BLOG_POSTS } from './data';
import BlogCard from './BlogCard';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

const CATEGORY_COLORS: Record<string, string> = {
  React: '#22d3ee',
  'Next.js': '#ffffff',
  Express: '#4ade80',
  DevOps: '#e879f9',
  All: '#3b82f6',
};

const CATEGORIES = ['All', 'React', 'Next.js', 'Express', 'DevOps'] as const;
type Category = (typeof CATEGORIES)[number];

export default function BlogsContainer() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return BLOG_POSTS;
    return BLOG_POSTS.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  useGSAP(() => {
    // Indicator animation
    const activeEl = document.querySelector(`[data-cat="${activeCategory}"]`) as HTMLElement;
    if (activeEl && indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        x: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        duration: 0.6,
        ease: 'elastic.out(1, 0.8)',
      });
    }

    // Background Glow Animation
    const targetColor = CATEGORY_COLORS[selectedPost?.category || activeCategory];
    gsap.to('.category-glow', {
      backgroundColor: targetColor,
      opacity: selectedPost ? 0.15 : 0.05,
      duration: 1,
    });

    // Content Transitions
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
    );

    // Code Reveal Animation
    if (selectedPost && codeRef.current) {
      gsap.fromTo(
        codeRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.3 },
      );
    }
  }, [activeCategory, selectedPost]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-12">
      {/* Dynamic Background Glow */}
      <div className="category-glow pointer-events-none absolute -top-40 left-1/2 z-0 h-[600px] w-[80%] -translate-x-1/2 rounded-full opacity-10 blur-[120px] transition-all duration-1000" />

      {/* Category Navigation */}
      <div className="no-scrollbar relative z-10 flex items-center gap-2 overflow-x-auto border-b border-white/5 pb-4">
        <div
          ref={indicatorRef}
          className="absolute bottom-0 h-1 rounded-full bg-blue-500"
          style={{ width: 0 }}
        />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            data-cat={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSelectedPost(null);
            }}
            className={`px-6 py-4 text-xs font-bold tracking-[0.2em] whitespace-nowrap uppercase transition-colors ${
              activeCategory === cat ? 'text-white' : 'text-muted-foreground hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div ref={contentRef} className="relative z-10">
        {!selectedPost ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
            ))}
          </div>
        ) : (
          /* Single Post View */
          <article className="mx-auto flex max-w-4xl flex-col gap-12">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-muted-foreground flex w-fit items-center gap-4 text-xs font-bold tracking-widest uppercase transition-colors hover:text-white"
            >
              <div className="bg-muted-foreground h-px w-8 transition-all hover:w-12" />
              Back to selection
            </button>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-blue-500" />
                <span className="text-xs font-bold tracking-[0.3em] text-blue-400 uppercase">
                  {selectedPost.category}
                </span>
              </div>

              <h1 className="font-display text-4xl leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
                {selectedPost.title}
              </h1>

              <div className="text-muted-foreground flex items-center gap-8 border-b border-white/5 pb-8 text-[10px] tracking-widest uppercase">
                <span>By {selectedPost.author}</span>
                <span>{selectedPost.date}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-8">
                <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                  {selectedPost.content}
                </p>
                <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-6">
                  <p className="text-sm font-medium text-blue-300 italic">
                    &quot;Architecting for the future requires understanding the nuances of
                    current-gen paradigms.&quot;
                  </p>
                </div>
              </div>

              <div ref={codeRef} className="flex flex-col gap-6">
                <span className="text-xs font-bold tracking-widest text-white/50 uppercase">
                  Technical Implementation
                </span>
                <div className="glass group relative overflow-hidden rounded-[2rem] border-white/10 ring-1 ring-white/5">
                  <div className="font-ops absolute top-0 right-0 p-3 text-[10px] tracking-tighter text-white/20 uppercase">
                    {selectedPost.language}
                  </div>
                  <div className="bg-[#0d1117]/80 p-8 backdrop-blur-xl">
                    <pre className="font-ops overflow-x-auto text-sm leading-relaxed text-blue-300">
                      <code>{selectedPost.code}</code>
                    </pre>
                  </div>
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
