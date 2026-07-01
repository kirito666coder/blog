'use client';
import { ReactNode, useRef, useState } from 'react';

export const SpanBox = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const boxRef = useRef<HTMLSpanElement>(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!boxRef.current) return;

    const rect = boxRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setPos({
      x: x * 0.5,
      y: y * 0.5,
    });
  };

  const handleLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <span
      ref={boxRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`font-ops absolute ${className} border-foreground/50 w-fit cursor-pointer overflow-hidden border-2 px-5`}
    >
      <span
        className="inline-block transition-transform duration-100"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
      >
        {children}
      </span>
    </span>
  );
};
