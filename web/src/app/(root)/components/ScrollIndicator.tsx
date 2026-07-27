'use client';

import { ChevronDown } from 'lucide-react';

export function ScrollIndicator() {
  return (
    <div className="text-foreground pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-300">
      <span className="text-xs tracking-widest uppercase opacity-70">
        Scroll
      </span>
      <ChevronDown className="h-5 w-5 animate-bounce" />
    </div>
  );
}
