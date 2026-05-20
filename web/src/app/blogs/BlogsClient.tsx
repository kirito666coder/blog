'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BlogCard } from './components/BlogCard';
import { CategoryFilter } from './components/CategoryFilter';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import type { Blog } from '@/models/blog.schema';
import Logo from '@/components/Logo';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'DevOps'];

export default function BlogsClient({
  initialBlogs,
}: {
  initialBlogs: Blog[];
}) {
  const [activeCategory, setActiveCategory] = useState('All');

  const blogs = initialBlogs;

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Hero animation
      const tl = gsap.timeline();
      tl.from(heroRef.current?.querySelectorAll('h1, p') || [], {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // Initial grid entry
      tl.from(
        gridRef.current?.children || [],
        {
          scale: 0.9,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        },
        '-=0.4'
      );
    },
    { scope: containerRef }
  );

  useEffect(() => {
    // Animate grid items when filtering
    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [activeCategory]);

  const filteredBlogs = useMemo(() => {
    return activeCategory === 'All'
      ? blogs
      : blogs.filter((blog) => blog.category === activeCategory);
  }, [activeCategory, blogs]);

  return (
    <main
      ref={containerRef}
      className="bg-background flex min-h-screen flex-col items-center px-6 pt-24 pb-20"
    >
      <div className="fixed top-[5%] left-[3%] z-50">
        <Logo className="text-3xl" />
      </div>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="mb-16 flex max-w-4xl flex-col items-center text-center"
      >
        <h1 className="font-ops mb-6 text-5xl font-extrabold tracking-tighter md:text-7xl">
          <span className="opacity-60">THE</span>{' '}
          <span className="opacity-100">BL&lt;G&gt;</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Deep dives into modern web technologies, architectural patterns, and
          the ever-evolving landscape of software engineering.
        </p>
      </section>

      {/* Filter Section */}
      <CategoryFilter
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Blogs Grid */}
      <div
        ref={gridRef}
        className="mt-12 grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredBlogs.map((blog) => (
          <BlogCard
            key={blog.slug}
            title={blog.title}
            slug={blog.slug}
            category={blog.category}
            excerpt={blog.excerpt ?? ''}
            tags={blog.tags}
          />
        ))}
        {filteredBlogs.length === 0 && (
          <div className="text-muted-foreground col-span-full py-20 text-center">
            No articles found in this category. Stay tuned!
          </div>
        )}
      </div>
    </main>
  );
}
