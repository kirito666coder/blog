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
            'group relative rounded-full border-2 px-6 py-2 text-sm font-medium transition-all duration-300',
            activeCategory === category
              ? 'border-foreground'
              : 'glass text-muted-foreground border-border hover:text-foreground'
          )}
        >
          {category}
          {activeCategory === category && (
            <span className="absolute -inset-px rounded-full opacity-20 blur-sm" />
          )}
        </button>
      ))}
    </div>
  );
};
