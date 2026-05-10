'use client';
import { useEffect, useRef, useState } from 'react';
import { ScrollSmoother } from '@/lib/gsap';
import Link from 'next/link';
import Scene from '@/components/model/Scene';
export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isHovered, setisHovered] = useState<boolean | string>(false);

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

  useEffect(() => {
    const audio = new Audio('/mainhoversound.mp3');

    audio.preload = 'auto';
    audio.volume = 1;
    audioRef.current = audio;
  }, []);

  const onHover = (text?: string) => {
    if (isHovered) return;
    if (text) {
      setisHovered(text);
    } else {
      setisHovered(true);
    }
    const audio = audioRef.current;

    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };
  const leaveHover = () => {
    if (!isHovered) return;
    setisHovered(false);
  };

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content" className="min-h-screen">
        <main className="relative h-screen">
          <div className="absolute h-screen w-screen">
            <Scene isHovered={isHovered} />
          </div>
          <div className="px-6 py-20 lg:py-32">
            <div
              className={`absolute ${isHovered && isHovered !== 'mainText' ? 'opacity-100' : 'opacity-50'}`}
            >
              <Link
                onMouseEnter={() => onHover()}
                onMouseLeave={() => leaveHover()}
                href="/"
                className="font-ops text-6xl tracking-tighter transition-opacity"
              >
                KIRITO
                <div className="leading-7">BLOG</div>
              </Link>
              <div className="mt-8 ml-2 flex items-center gap-5">
                <Link
                  onMouseEnter={() => onHover()}
                  onMouseLeave={() => leaveHover()}
                  href="/blogs"
                >
                  Blogs
                </Link>
                <Link
                  onMouseEnter={() => onHover()}
                  onMouseLeave={() => leaveHover()}
                  href="/about"
                >
                  About
                </Link>
              </div>
            </div>
            <h1
              onMouseEnter={() => onHover('mainText')}
              onMouseLeave={() => leaveHover()}
              className={`absolute bottom-0 ${isHovered === 'mainText' ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className="text-2xl leading-20">MUSIC VIDEO 2023</div>
              <div className="font-ops text-7xl leading-9 uppercase md:text-8xl md:leading-12 lg:text-9xl">
                ticking
              </div>
              <div className="font-ops text-7xl uppercase md:text-8xl lg:text-9xl">
                Away
              </div>
            </h1>
          </div>
        </main>
      </div>
    </div>
  );
}
