'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export function ScrollIndicator({
  progressRef,
}: {
  progressRef?: React.MutableRefObject<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressRef) return;

    let raf: number;
    const tick = () => {
      if (ref.current) {
        const opacity = Math.max(0, 1 - progressRef.current / 0.15);
        ref.current.style.opacity = String(opacity);
        ref.current.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  return (
    <div
      ref={ref}
      className="text-foreground pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-300"
    >
      <span className="text-xs tracking-widest uppercase opacity-70">
        Scroll
      </span>
      <ChevronDown className="h-5 w-5 animate-bounce" />
    </div>
  );
}
