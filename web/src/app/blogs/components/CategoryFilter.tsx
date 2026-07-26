'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-10">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              'group relative rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ease-out',
              isActive
                ? 'text-background shadow-foreground/20 scale-105 shadow-lg'
                : 'text-muted-foreground hover:text-foreground bg-foreground/5 border-border/50 hover:border-foreground/30 hover:bg-foreground/10 border backdrop-blur-md'
            )}
          >
            <span className="relative z-10">{category}</span>
            {isActive && (
              <span className="bg-foreground absolute inset-0 z-0 rounded-full transition-all duration-300" />
            )}
          </button>
        );
      })}
    </div>
  );
};
