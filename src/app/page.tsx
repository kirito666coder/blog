'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryFilter } from '@/components/CategoryFilter';
import { BlogCard } from '@/components/BlogCard';
import type { Category } from '@/data/blogs';
import { blogs } from '@/data/blogs';
import { Navbar } from '@/components/navbar/Navbar';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const filteredBlogs =
    selectedCategory === 'All' ? blogs : blogs.filter((blog) => blog.category === selectedCategory);

  return (
    <div className="bg-background text-foreground selection:bg-foreground selection:text-background min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <header className="mb-16 flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <div className="bg-foreground/20 h-px w-12" />
              <span className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase">
                Welcome to <span className="text-white">Kirito</span> Blog
              </span>
            </div>

            <h1 className="font-display text-center text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
              A personal space for <span className="text-red-500">development</span> <br />
              and <span className="text-blue-500">system design</span>
            </h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <CategoryFilter selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          </motion.div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredBlogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {filteredBlogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-muted-foreground italic">No blogs found in this category.</p>
          </motion.div>
        )}
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
  );
}
