'use client';

import { useEffect, useRef } from 'react';

import { useAppStore } from '@/store/app-store';

export const GlobalMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicEnabled = useAppStore((s) => s.musicEnabled);

  const setMusicEnabled = useAppStore((s) => s.setMusicEnabled);

  const loading = useAppStore((s) => s.loading);

  useEffect(() => {
    const audio = new Audio('/DirtySprite.mp3');

    audio.loop = true;

    audio.volume = 0.4;

    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (musicEnabled) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [musicEnabled]);

  /*
   * hide during loader
   */
  if (loading) return null;

  return (
    <button
      onClick={() => setMusicEnabled(!musicEnabled)}
      className="fixed right-6 bottom-6 z-[99999] flex items-center gap-4 rounded-full border border-white/10 bg-black/20 px-5 py-3 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:bg-black/40"
    >
      {/* smooth wave */}
      <div className="flex h-5 items-center gap-[4px]">
        <span
          className={`w-[3px] rounded-full bg-white transition-all duration-300 ${
            musicEnabled ? 'h-2 animate-[wave_1s_ease-in-out_infinite]' : 'h-2'
          }`}
        />

        <span
          className={`w-[3px] rounded-full bg-white transition-all duration-300 ${
            musicEnabled
              ? 'h-5 animate-[wave_1.2s_ease-in-out_infinite]'
              : 'h-2'
          }`}
        />

        <span
          className={`w-[3px] rounded-full bg-white transition-all duration-300 ${
            musicEnabled
              ? 'h-3 animate-[wave_0.8s_ease-in-out_infinite]'
              : 'h-2'
          }`}
        />
      </div>
    </button>
  );
};
