'use client';

import React from 'react';
import Link from 'next/link';

interface BlogCardProps {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  tags: string[];
  readingTime?: number;
  createdAt?: string;
  coverImage?: {
    url: string;
    alt: string;
  };
}

export const BlogCard = ({
  title,
  slug,
  category,
  excerpt,
  tags,
  readingTime = 5,
  createdAt,
  coverImage,
}: BlogCardProps) => {
  const formattedDate = createdAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(createdAt))
    : 'Recently';

  return (
    <Link href={`/blogs/${slug}`} className="group block h-full">
      <div className="bg-foreground/5 border-border/50 hover:border-foreground/30 hover:shadow-foreground/10 relative flex h-full flex-col overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        {/* Image Header */}
        <div className="bg-muted/20 relative h-48 w-full overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage.url}
              alt={coverImage.alt}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <svg
                className="h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          )}

          <div className="bg-background/20 absolute inset-0" />

          <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
            <span className="rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md">
              {category}
            </span>
            <span className="bg-background/60 border-border/50 text-foreground flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {readingTime} min
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-foreground group-hover:text-primary mb-3 text-xl leading-snug font-bold transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground mb-6 line-clamp-3 text-sm leading-relaxed">
            {excerpt}
          </p>

          {/* Tags */}
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-muted-foreground group-hover:text-foreground text-xs font-medium transition-colors"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-muted-foreground text-xs font-medium">
                +{tags.length - 3} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="border-border/50 mt-auto flex items-center justify-between border-t pt-4">
            <span className="text-muted-foreground text-xs font-medium">
              {formattedDate}
            </span>
            <div className="text-foreground flex items-center gap-1 text-xs font-bold opacity-70 transition-all group-hover:translate-x-1 group-hover:opacity-100">
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
        </div>
      </div>
    </Link>
  );
};
