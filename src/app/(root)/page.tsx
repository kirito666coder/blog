'use client';
import { useEffect, useState } from 'react';
import { ScrollSmoother } from '@/lib/gsap';
import Link from 'next/link';
import Scene from '@/components/model/Scene';
export default function Home() {
  const [isHovered, setisHovered] = useState<boolean>(false);

  useEffect(() => {
    if (!window) return;
    const smoother = ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });
    return () => {
      smoother.kill();
    };
  });

  const onHover = () => {
    const audio = new Audio('/mainhoversound.mp3');
    setisHovered(true);
    audio.volume = 1;
    audio.play();
  };

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content" className="min-h-screen">
        <main className="relative h-screen">
          <div className="absolute h-screen w-screen">
            <Scene isHovered={isHovered} />
          </div>
          <div className="px-6 py-20 lg:py-32">
            <Link
              onMouseEnter={() => onHover()}
              onMouseLeave={() => setisHovered(false)}
              href="/"
              className="font-ops absolute text-6xl tracking-tighter opacity-80 transition-opacity hover:opacity-100"
            >
              KIRITO
              <div className="leading-7">BLOG</div>
            </Link>
            <h1 className="absolute bottom-0">
              <div className="text-2xl leading-20">MUSIC VIDEO 2023</div>
              <div className="font-ops text-7xl leading-9 uppercase md:text-8xl md:leading-12 lg:text-9xl">
                ticking
              </div>
              <div className="font-ops text-7xl uppercase md:text-8xl lg:text-9xl">Away</div>
            </h1>
          </div>
        </main>
      </div>
    </div>
  );
}
