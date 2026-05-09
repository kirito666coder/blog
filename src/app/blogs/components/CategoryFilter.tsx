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
    <div className="flex flex-wrap items-center justify-center gap-4 py-8">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            'group relative rounded-full px-6 py-2 text-sm font-medium transition-all duration-300',
            activeCategory === category
              ? 'border border-white bg-white/10 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              : 'glass text-muted-foreground hover:text-white',
          )}
        >
          {category}
          {activeCategory === category && (
            <span className="absolute -inset-px rounded-full bg-white/10 opacity-20 blur-sm" />
          )}
        </button>
      ))}
    </div>
  );
};
