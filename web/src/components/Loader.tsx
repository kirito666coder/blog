'use client';

import { useRef, useState } from 'react';

import { useAppStore } from '@/store/app-store';

type IntroLoaderProps = {
  visible: boolean;
};

export const IntroLoader = ({ visible }: IntroLoaderProps) => {
  const [hovered, setHovered] = useState(false);

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const musicEnabled = useAppStore((s) => s.musicEnabled);

  const setMusicEnabled = useAppStore((s) => s.setMusicEnabled);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-black transition-all duration-1000 ${
        visible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-3xl" />

      {/* FOLLOW CURSOR TEXT */}
      <div
        className={`pointer-events-none absolute z-50 transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: mousePosition.x + 30,
          top: mousePosition.y - 30,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-[10px] tracking-[0.35em] whitespace-nowrap uppercase backdrop-blur-xl">
          Enter With Music
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* SCI-FI RING */}
        <div className="relative mb-10 flex h-56 w-56 items-center justify-center">
          {/* OUTER GLOW */}
          <div className="absolute h-full w-full rounded-full bg-white/[0.03] blur-3xl" />

          {/* STATIC OUTER RING */}
          <div className="absolute inset-0 rounded-full border border-white/10" />

          {/* ROTATING RING */}
          <div className="absolute inset-0 animate-[spin_5s_linear_infinite] rounded-full border border-transparent border-t-white border-r-white/40" />

          {/* REVERSE RING */}
          <div className="animate-spin-reverse absolute inset-3 rounded-full border border-transparent border-b-white/80 border-l-white/30" />

          {/* DASHED RING */}
          <div className="absolute inset-6 rounded-full border border-dashed border-white/10" />

          {/* INNER PULSE RING */}
          <div className="absolute inset-10 animate-pulse rounded-full border border-white/10" />

          {/* SCAN LINE */}
          <div className="absolute h-[2px] w-44 animate-pulse bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px]" />

          {/* CENTER GLOW */}
          <div className="absolute h-36 w-36 rounded-full bg-white/[0.04] blur-2xl" />

          {/* CENTER BUTTON */}
          <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setMusicEnabled(!musicEnabled)}
            className="group relative z-20 flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-2xl transition-all duration-500 hover:scale-105 hover:border-white/20"
          >
            {/* INNER BORDER */}
            <div className="absolute inset-2 rounded-full border border-white/5" />

            {/* PLAY ICON */}
            {!musicEnabled ? (
              <div className="ml-1 text-4xl text-white transition-all duration-300 group-hover:scale-125 group-hover:text-white/90">
                ▶
              </div>
            ) : (
              <div className="flex items-center gap-[6px]">
                <span className="h-3 w-[4px] animate-[wave_0.7s_ease-in-out_infinite] rounded-full bg-white shadow-[0_0_10px_white]" />

                <span className="h-8 w-[4px] animate-[wave_1s_ease-in-out_infinite] rounded-full bg-white shadow-[0_0_12px_white]" />

                <span className="h-5 w-[4px] animate-[wave_0.6s_ease-in-out_infinite] rounded-full bg-white shadow-[0_0_10px_white]" />
              </div>
            )}
          </button>
        </div>

        {/* LOGO */}
        <h1 className="font-ops text-7xl tracking-tight text-white">KIRITO</h1>

        {/* SUBTEXT */}
        <p className="mt-5 text-xs tracking-[0.6em] text-neutral-500 uppercase">
          INITIALIZING INTERFACE
        </p>
      </div>
    </div>
  );
};
