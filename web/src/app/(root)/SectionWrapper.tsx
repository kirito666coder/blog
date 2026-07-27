'use client';
import { ReactNode, useEffect, useRef } from 'react';
import Footer from './Footer';
import BentoGrid from './BentoGrid';
import HeroSection from './HeroSection';
import { gsap, ScrollSmoother } from '@/lib/gsap';

export default function SectionWrapper({
  children,
  loading,
}: {
  children: ReactNode;
  loading: boolean;
}) {
  const mainLayerRef = useRef<HTMLDivElement>(null);
  const secondLayerRef = useRef<HTMLDivElement>(null);
  const thirdLayerRef = useRef<HTMLDivElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;

    const smoother = ScrollSmoother.create({ smooth: 3, effects: true });

    const ctx = gsap.context(() => {
      gsap.set(mainLayerRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.set(secondLayerRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.set(thirdLayerRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrapRef.current,
          start: 'top top',
          end: '+=300%',
          scrub: true,
          pin: true,
        },
      });

      tl.to(mainLayerRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        ease: 'none',
      });

      tl.to(secondLayerRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        ease: 'none',
      });

      tl.to(thirdLayerRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        ease: 'none',
      });
    });

    return () => {
      ctx.revert();
      smoother.kill();
    };
  }, [loading]);
  return (
    <>
      <div ref={pinWrapRef} className="relative">
        <div className="bg-background absolute inset-0 z-10 h-screen w-screen">
          <Footer />
        </div>

        <div
          ref={thirdLayerRef}
          className="bg-background absolute inset-0 z-20 h-screen w-screen overflow-hidden"
        >
          <BentoGrid />
        </div>

        <div
          ref={secondLayerRef}
          className="bg-background absolute inset-0 z-30 h-screen w-screen overflow-hidden"
        >
          <HeroSection />
        </div>
        <div
          ref={mainLayerRef}
          className="bg-background absolute inset-0 z-40 h-screen w-screen overflow-hidden"
        >
          {children}
        </div>
      </div>
      <div className="h-screen" />
    </>
  );
}
