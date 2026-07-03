'use client';

import { useEffect, useRef } from 'react';

interface ScrollMarqueeProps {
  text: string;
  direction?: -1 | 1; // Base direction: -1 for left, 1 for right
  baseSpeed?: number; // Speed of continuous movement
  scrollSpeed?: number; // Additional speed multiplier when scrolling
  className?: string;
  textClassName?: string;
}

export function ScrollMarquee({
  text,
  direction = -1,
  baseSpeed = 1,
  scrollSpeed = 0.5,
  className = '',
  textClassName = '',
}: ScrollMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastScrollY = window.scrollY;
    let currentX = 0;
    let currentDirection = direction;

    // Delay initialization slightly to ensure fonts load and widths are accurate
    const initId = setTimeout(() => {
      let singleBlockWidth = 0;
      if (textRef.current && textRef.current.children.length > 0) {
        singleBlockWidth = (textRef.current.children[0] as HTMLElement)
          .offsetWidth;
      }

      const loop = () => {
        if (!textRef.current) return;

        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        // Change continuous direction based on scroll direction
        if (scrollDelta > 0) {
          currentDirection = direction; // Scroll down uses base direction
        } else if (scrollDelta < 0) {
          currentDirection = -direction; // Scroll up uses opposite direction
        }

        lastScrollY = currentScrollY;

        // Move by base speed + extra speed from scroll delta
        currentX +=
          (baseSpeed + Math.abs(scrollDelta) * scrollSpeed) * currentDirection;

        // Seamless infinite loop logic
        if (singleBlockWidth > 0) {
          if (currentX <= -singleBlockWidth) {
            currentX += singleBlockWidth;
          } else if (currentX >= 0) {
            currentX -= singleBlockWidth;
          }
        }

        textRef.current.style.transform = `translate3d(${currentX}px, 0, 0)`;
        animationFrameId = requestAnimationFrame(loop);
      };

      loop();
    }, 100);

    return () => {
      clearTimeout(initId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [direction, baseSpeed, scrollSpeed]);

  // Create enough text to fill the screen once
  const repeatedText = Array(15).fill(text);

  return (
    <div
      ref={containerRef}
      className={`flex w-full items-center overflow-hidden whitespace-nowrap ${className}`}
    >
      <div
        ref={textRef}
        className={`flex whitespace-nowrap will-change-transform ${textClassName}`}
      >
        {/* Block 1 */}
        <div className="font-ops hover:text-foreground flex shrink-0 cursor-default items-center justify-around gap-12 pr-12 tracking-[0.2em] text-transparent opacity-50 transition-colors duration-700 [-webkit-text-stroke:2px_var(--foreground)] hover:opacity-100 hover:[-webkit-text-stroke:2px_transparent]">
          {repeatedText.map((t, i) => (
            <span key={`block1-${i}`}>{t}</span>
          ))}
        </div>

        {/* Block 2 (identical clone for seamless looping) */}
        <div className="font-ops hover:text-foreground flex shrink-0 cursor-default items-center justify-around gap-12 pr-12 tracking-[0.2em] text-transparent opacity-50 transition-colors duration-700 [-webkit-text-stroke:2px_var(--foreground)] hover:opacity-100 hover:[-webkit-text-stroke:2px_transparent]">
          {repeatedText.map((t, i) => (
            <span key={`block2-${i}`}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
