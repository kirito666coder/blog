'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowUpRight } from 'lucide-react';
import type { BlogPost } from '@/data/blogs';

interface BlogCardProps {
  blog: BlogPost;
  index: number;
}

export function BlogCard({ blog, index }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group border-border/40 glass hover:border-foreground/20 premium-shadow relative flex flex-col gap-4 rounded-2xl border p-6 transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
          {blog.category}
        </span>
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="h-3 w-3" />
          {blog.date}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl leading-snug decoration-1 underline-offset-4 group-hover:underline">
          {blog.title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {blog.description}
        </p>
      </div>

      <Link
        href={`/blog/${blog.slug}`}
        className="mt-2 flex items-center gap-2 text-sm font-bold transition-transform group-hover:translate-x-1"
      >
        Read More
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
