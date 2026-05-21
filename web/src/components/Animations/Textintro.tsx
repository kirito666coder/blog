'use client';

import { gsap, SplitText } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

export default function TextIntro({ children }: { children: React.ReactNode }) {
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const text = SplitText.create(textRef.current, {
      type: 'lines',
      mask: 'lines',
    });

    const tl = gsap.timeline();

    tl.to(overlayRef.current, {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      duration: 0.8,
      ease: 'power2.inOut',
    })

      .from(
        text.lines,
        {
          yPercent: 100,
          opacity: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power3.out',
        },
        '>-0.1'
      )

      .to(
        overlayRef.current,
        {
          clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '<'
      );
  });

  return (
    <div className="relative overflow-hidden">
      <div
        ref={overlayRef}
        className="bg-foreground border-foreground absolute inset-0 z-10 border"
        style={{
          clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
        }}
      />

      <div ref={textRef} className="relative z-0">
        {children}
      </div>
    </div>
  );
}
