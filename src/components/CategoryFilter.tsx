'use client';

import type { Category } from '@/data/blogs';
import { categories } from '@/data/blogs';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: Category | 'All';
  onSelect: (category: Category | 'All') => void;
}

export function CategoryFilter({ selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelect('All')}
        className={cn(
          'rounded-full border px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-all',
          selectedCategory === 'All'
            ? 'bg-foreground text-background border-foreground'
            : 'text-muted-foreground border-border/40 hover:border-foreground/20 bg-transparent',
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-all',
            selectedCategory === category
              ? 'bg-foreground text-background border-foreground'
              : 'text-muted-foreground border-border/40 hover:border-foreground/20 bg-transparent',
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
