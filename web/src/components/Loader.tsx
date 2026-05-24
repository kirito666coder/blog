'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

type IntroLoaderProps = {
  visible: boolean;
};

export const IntroLoader = ({ visible }: IntroLoaderProps) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const reactorRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const magneticTextRef = useRef<HTMLDivElement | null>(null);
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);
  const modulesRef = useRef<(HTMLDivElement | null)[]>([]);
  const textsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scanRef = useRef<HTMLDivElement | null>(null);
  const hologramRef = useRef<HTMLDivElement | null>(null);
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const musicEnabled = useAppStore((s) => s.musicEnabled);
  const setMusicEnabled = useAppStore((s) => s.setMusicEnabled);

  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showMagneticText, setShowMagneticText] = useState(false);

  // Hydration-safe time
  const [currentTime, setCurrentTime] = useState<string>('');

  // Deterministic particles
  const particles = useMemo(() => {
    const count = 180;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (i * 7) % 100,
      y: (i * 13) % 100,
      size: (i % 3) + 1,
      speedX: (Math.sin(i) * 0.1 + 0.1) % 0.3,
    }));
  }, []);

  const dataStreams = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: (i * 3.571) % 100,
        delay: (i * 0.178) % 5,
        duration: 1.5 + (i % 20) / 10,
      })),
    []
  );

  const [systemStats, setSystemStats] = useState({
    access: 94,
    decrypt: 87,
    handshake: 99,
    rootkit: 72,
  });

  // Client-only time updates – deferred first tick
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 0);
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats((prev) => ({
        access: Math.min(
          100,
          Math.max(65, prev.access + (Math.random() - 0.5) * 4)
        ),
        decrypt: Math.min(
          100,
          Math.max(70, prev.decrypt + (Math.random() - 0.5) * 3)
        ),
        handshake: Math.min(
          100,
          Math.max(85, prev.handshake + (Math.random() - 0.5) * 2)
        ),
        rootkit: Math.min(
          100,
          Math.max(50, prev.rootkit + (Math.random() - 0.5) * 5)
        ),
      }));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    glitchIntervalRef.current = setInterval(() => {
      const elements = document.querySelectorAll('.glitch-text');
      elements.forEach((el) => {
        if (Math.random() > 0.8) {
          el.classList.add('animate-glitch');
          setTimeout(() => el.classList.remove('animate-glitch'), 120);
        }
      });
    }, 2800);
    return () => {
      if (glitchIntervalRef.current) clearInterval(glitchIntervalRef.current);
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    gsap.set(cameraRef.current, {
      transformPerspective: 6000,
      transformStyle: 'preserve-3d',
    });

    gsap.set(reactorRef.current, {
      rotateX: 12,
      rotateY: -8,
      scale: 0.8,
      opacity: 0,
      transformPerspective: 6000,
      transformOrigin: 'center center',
    });

    gsap.set(coreRef.current, {
      opacity: 1,
      scale: 1,
    });

    gsap.set(buttonRef.current, { clearProps: 'transform' });

    const tl = gsap.timeline();

    tl.to(reactorRef.current, {
      rotateX: 5,
      rotateY: 0,
      scale: 1,
      opacity: 1,
      duration: 3.2,
      ease: 'back.out(0.6)',
    });

    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      tl.fromTo(
        ring,
        {
          opacity: 0,
          scale: 0,
          rotate: i % 2 === 0 ? -160 : 160,
        },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 2,
          ease: 'elastic.out(0.6, 0.3)',
        },
        `-=${1.8 - i * 0.1}`
      );
    });

    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      gsap.to(ring, {
        rotate: i % 2 === 0 ? 360 : -360,
        duration: 22 + i * 3,
        repeat: -1,
        ease: 'none',
      });
    });

    modulesRef.current.forEach((module, i) => {
      if (!module) return;
      gsap.to(module, {
        y: i % 2 === 0 ? -32 : 32,
        x: i % 2 === 0 ? 16 : -16,
        rotateZ: i % 3 === 0 ? 8 : -6,
        rotateX: i % 2 === 0 ? 3 : -3,
        duration: 4.2 + i * 0.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    gsap.to(hologramRef.current, {
      y: 10,
      rotateY: 6,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to(scanRef.current, {
      rotate: 360,
      duration: 8,
      repeat: -1,
      ease: 'none',
      transformOrigin: 'center center',
    });

    gsap.to(coreRef.current, {
      scale: 1.015,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      gsap.killTweensOf('*');
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneRef.current || !cameraRef.current || !reactorRef.current) return;

    const rect = sceneRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.height / 2) / rect.height;

    gsap.to(cameraRef.current, {
      rotateY: x * 8,
      rotateX: -y * 5,
      duration: 1,
      ease: 'power2.out',
    });

    gsap.to(reactorRef.current, {
      rotateY: x * 20,
      rotateX: -y * 14,
      duration: 0.9,
      ease: 'power2.out',
    });

    gsap.to(coreRef.current, {
      rotateY: x * 28,
      rotateX: -y * 22,
      duration: 0.7,
      ease: 'power2.out',
    });
  };

  const handleButtonHover = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      boxShadow:
        '0 0 100px rgba(255,255,255,0.25), inset 0 0 50px rgba(255,255,255,0.1)',
      duration: 0.3,
    });
  };

  const handleButtonLeave = () => {
    setIsButtonHovered(false);
    // Smooth exit for magnetic text
    if (magneticTextRef.current) {
      gsap.to(magneticTextRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'back.in(1.2)',
        onComplete: () => setShowMagneticText(false),
      });
    }
    gsap.to(buttonRef.current, {
      scale: 1,
      boxShadow:
        '0 0 80px rgba(255,255,255,0.1), inset 0 0 30px rgba(255,255,255,0.03)',
      duration: 0.3,
    });
  };

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonContainerRef.current) return;
    const rect = buttonContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMousePos({ x: mouseX, y: mouseY });
  };

  // Show magnetic text with entry animation
  const handleMouseEnterButton = () => {
    setIsButtonHovered(true);
    setShowMagneticText(true);
    handleButtonHover();
    // Entry animation
    setTimeout(() => {
      if (magneticTextRef.current) {
        gsap.fromTo(
          magneticTextRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.2)' }
        );
      }
    }, 10);
  };

  // Update magnetic text position
  useEffect(() => {
    if (!magneticTextRef.current || !showMagneticText) return;
    gsap.to(magneticTextRef.current, {
      left: mousePos.x,
      top: mousePos.y,
      duration: 0.15,
      ease: 'power2.out',
      overwrite: true,
    });
  }, [mousePos, showMagneticText]);

  return (
    <div
      ref={sceneRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[999999] overflow-hidden bg-black transition-all duration-1000 will-change-transform ${
        visible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Top loading title */}
      <div className="absolute top-5 left-1/2 z-[999999] -translate-x-1/2 text-center md:top-8">
        <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-white/80 md:text-sm">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white/80" />
          <span className="tracking-[0.2em]">SYSTEM INITIALIZATION</span>
          <span className="animate-pulse">_</span>
        </div>
        <div className="mt-1 h-px w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent md:w-48" />
      </div>

      {/* Background layers */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.04),transparent_50%)]" />

      {/* Holographic grid */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '35px 35px',
          transform: 'rotateX(55deg) rotateZ(-18deg) scale(2)',
          transformOrigin: 'center center',
          opacity: 0.25,
        }}
      />

      {/* Data streams */}
      {dataStreams.map((stream) => (
        <div
          key={stream.id}
          className="absolute top-0 w-px bg-gradient-to-b from-white/0 via-white/40 to-white/0"
          style={{
            left: `${stream.left}%`,
            height: '100%',
            animation: `dataStream ${stream.duration}s linear infinite`,
            animationDelay: `${stream.delay}s`,
          }}
        />
      ))}

      {/* Floating particles */}
      <div suppressHydrationWarning>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/30 will-change-transform"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              boxShadow: `0 0 ${particle.size * 1.5}px rgba(255,255,255,0.4)`,
              animation: `floatParticle ${6 / particle.speedX}s infinite alternate ease-in-out`,
            }}
          />
        ))}
      </div>

      {/* Left terminal panel */}
      <div className="absolute top-1/2 left-3 z-[99999] w-48 -translate-y-1/2 rounded-md border border-white/20 bg-black/80 p-2 font-mono text-[8px] tracking-wider uppercase backdrop-blur-md sm:left-5 sm:w-64 sm:p-3 sm:text-[10px]">
        <div className="mb-2 flex items-center gap-2 border-b border-white/20 pb-1">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white/80" />
          <span className="text-white/80">{'>'}_ ACCESS LOG</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-white/50">ROOT ACCESS</span>
            <span className="text-white/80">
              {systemStats.access.toFixed(0)}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-white/70 transition-all duration-300"
              style={{ width: `${systemStats.access}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-white/50">DECRYPT SEQ</span>
            <span className="text-white/80">
              {systemStats.decrypt.toFixed(0)}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-white/70 transition-all duration-300"
              style={{ width: `${systemStats.decrypt}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-white/50">SSL HANDSHAKE</span>
            <span className="text-white/80">
              {systemStats.handshake.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-white/50">ROOTKIT DEPLOY</span>
            <span className="text-white/80">
              {systemStats.rootkit.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="mt-2 border-t border-white/10 pt-1 text-[7px] tracking-wider text-white/40 sm:text-[8px]">
          {currentTime && `[${currentTime}] SYSTEM BREACH`}
        </div>
      </div>

      {/* Right terminal panel */}
      <div className="absolute top-1/2 right-3 z-[99999] w-48 -translate-y-1/2 rounded-md border border-white/20 bg-black/80 p-2 font-mono text-[8px] tracking-wider uppercase backdrop-blur-md sm:right-5 sm:w-64 sm:p-3 sm:text-[10px]">
        <div className="mb-2 flex items-center gap-2 border-b border-white/20 pb-1">
          <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
          <span className="text-white/80">{'>'}_ TARGET_ENV</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-white/50">HOST</span>
            <span className="text-white/80">KIRITO_BLOG</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">FIREWALL</span>
            <span className="text-white/80">BYPASSED</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">NODE</span>
            <span className="text-white/80">ONION_V3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">PAYLOAD</span>
            <span className="animate-pulse text-white/80">READY</span>
          </div>
        </div>
        <div className="mt-2 border-t border-white/10 pt-1 text-[7px] tracking-wider text-white/40 sm:text-[8px]">
          &gt; decrypting content...
        </div>
      </div>

      {/* 3D Camera container */}
      <div
        ref={cameraRef}
        className="relative flex h-full items-center justify-center"
        style={{ transformStyle: 'preserve-3d', perspective: '6000px' }}
      >
        {/* HUD text overlay */}
        <div className="absolute top-3 left-3 z-[99999] space-y-1 font-mono text-[7px] tracking-[0.3em] text-white/60 uppercase sm:top-6 sm:left-6 sm:text-[9px]">
          {[
            '>_ KIRITO_CORE',
            '>_ ROOT_ACCESS',
            '>_ DECRYPTING',
            '>_ GHOST_PROTOCOL',
            '>_ ANON_MODE',
            '>_ BLOG_INJECTION',
          ].map((item, i) => (
            <div
              key={item}
              ref={(el) => {
                textsRef.current[i] = el;
              }}
              className="glitch-text relative"
            >
              <span className="relative z-10">{item}</span>
              <span className="absolute top-0 left-0 text-white opacity-30 blur-[0.5px]">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Main Reactor */}
        <div
          ref={reactorRef}
          className="relative flex h-[600px] w-[600px] scale-75 items-center justify-center md:h-[1100px] md:w-[1100px] md:scale-100"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Outer floating modules */}
          {[...Array(32)].map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                modulesRef.current[i] = el;
              }}
              className="absolute"
              style={{
                transform: `rotate(${i * 11.25}deg) translateY(-320px) translateZ(${i % 2 === 0 ? 80 : -80}px)`,
                zIndex: 20,
              }}
            >
              <div className="relative h-20 w-7 rounded-sm border border-white/10 bg-white/[0.03] backdrop-blur-sm md:h-28 md:w-10">
                <div className="absolute top-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/60 shadow-[0_0_6px_white]" />
                <div className="absolute bottom-2 left-1/2 h-6 w-px -translate-x-1/2 bg-gradient-to-b from-white/40 to-transparent md:h-10" />
                <div className="absolute top-8 left-1/2 h-5 w-[1px] -translate-x-1/2 bg-white/30 md:h-7" />
              </div>
            </div>
          ))}

          {/* Massive rings */}
          {[540, 480, 420, 360, 300, 240].map((size, i) => (
            <div
              key={size}
              ref={(el) => {
                ringsRef.current[i] = el;
              }}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                border: `1px solid rgba(255,255,255,${i % 2 === 0 ? 0.1 : 0.06})`,
                transform: `translateZ(${-250 + i * 45}px)`,
                boxShadow: i === 2 ? '0 0 30px rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <div
                className={`absolute inset-0 rounded-full ${
                  i % 2 === 0
                    ? 'border-[4px] border-transparent border-t-white/15'
                    : 'border-[4px] border-transparent border-b-white/10'
                }`}
              />
              {[...Array(72)].map((_, x) => (
                <div
                  key={x}
                  className="absolute h-full w-full"
                  style={{ transform: `rotate(${x * 5}deg)` }}
                >
                  <div className="absolute top-0 left-1/2 h-5 w-px -translate-x-1/2 bg-gradient-to-b from-white/30 to-transparent md:h-8" />
                </div>
              ))}
            </div>
          ))}

          {/* Energy lines */}
          {[...Array(160)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[350px] w-px md:h-[600px]"
              style={{ transform: `rotate(${i * 2.25}deg)` }}
            >
              <div className="absolute top-0 h-8 w-full bg-gradient-to-b from-white/20 to-transparent md:h-14" />
              <div className="absolute bottom-0 h-3 w-full bg-gradient-to-t from-white/10 to-transparent md:h-6" />
            </div>
          ))}

          {/* Holographic data ring */}
          <div
            ref={hologramRef}
            className="absolute h-[400px] w-[400px] rounded-full border border-white/15 md:h-[660px] md:w-[660px]"
            style={{ transform: 'translateZ(100px)', zIndex: 15 }}
          >
            <div className="animate-spin-slow absolute inset-0 rounded-full border border-dashed border-white/20" />
            <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
          </div>

          {/* Scanning line */}
          <div
            ref={scanRef}
            className="absolute h-[1px] w-[540px] md:h-[2px] md:w-[920px]"
            style={{ transform: 'translateZ(70px)', zIndex: 500 }}
          >
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-70 blur-[0.5px] md:blur-[1px]" />
          </div>
        </div>

        {/* Main Core */}
        <div
          ref={coreRef}
          className="absolute flex h-[300px] w-[300px] items-center justify-center rounded-full border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-2xl md:h-[500px] md:w-[500px]"
          style={{
            transform: 'translateZ(150px)',
            zIndex: 999,
            boxShadow:
              '0 0 80px rgba(255,255,255,0.05), inset 0 0 50px rgba(255,255,255,0.02)',
          }}
        >
          {/* Tech panels */}
          {[...Array(36)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[260px] w-[12px] md:h-[450px] md:w-[20px]"
              style={{ transform: `rotate(${i * 10}deg)` }}
            >
              <div className="absolute top-0 h-8 w-full rounded-sm border border-white/10 bg-white/[0.05] md:h-12" />
              <div className="border-white/05 absolute bottom-0 h-6 w-full rounded-sm border bg-white/[0.03] md:h-10" />
            </div>
          ))}

          {/* Inner rings */}
          {[260, 230, 200, 170, 140].map((size, i) => (
            <div
              key={size}
              ref={(el) => {
                ringsRef.current[6 + i] = el;
              }}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                className={`absolute inset-0 rounded-full ${
                  i % 2 === 0
                    ? 'border-[3px] border-transparent border-t-white/15'
                    : 'border-[3px] border-transparent border-b-white/10'
                }`}
              />
            </div>
          ))}

          {/* Mechanical shutters */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 h-[100px] w-[18px] origin-bottom md:h-[170px] md:w-[28px]"
              style={{
                transform: `translate(-50%,-100%) rotate(${i * 22.5}deg)`,
              }}
            >
              <div
                className="h-full w-full border border-white/10 bg-gradient-to-b from-white/10 to-transparent"
                style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
              />
            </div>
          ))}

          {/* Core glows */}
          <div className="absolute h-[130px] w-[130px] rounded-full border border-white/20 bg-black/80 shadow-[0_0_40px_rgba(255,255,255,0.1)] backdrop-blur-3xl md:h-[210px] md:w-[210px]" />
          <div className="absolute h-[100px] w-[100px] rounded-full bg-white/10 blur-2xl md:h-[160px] md:w-[160px]" />
          <div className="absolute h-[60px] w-[60px] rounded-full bg-white/20 blur-xl md:h-[100px] md:w-[100px]" />

          {/* Volume control button with magnetic text */}
          <div
            ref={buttonContainerRef}
            className="absolute z-[999999]"
            style={{ transform: 'translateZ(320px)' }}
          >
            <button
              ref={buttonRef}
              onClick={() => setMusicEnabled(!musicEnabled)}
              onMouseEnter={handleMouseEnterButton}
              onMouseLeave={handleButtonLeave}
              onMouseMove={handleButtonMouseMove}
              className="flex h-[90px] w-[90px] cursor-pointer items-center justify-center rounded-full border border-white/20 bg-gradient-to-b from-black to-neutral-950 transition-all duration-300 md:h-[150px] md:w-[150px]"
              style={{
                boxShadow:
                  '0 0 50px rgba(255,255,255,0.1), inset 0 0 25px rgba(255,255,255,0.02)',
              }}
            >
              <div className="absolute inset-2 rounded-full border border-white/15 md:inset-3" />
              <div className="absolute inset-4 rounded-full border border-white/10 md:inset-6" />
              <div className="absolute h-8 w-8 rounded-full border border-white/30 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.3)] md:h-14 md:w-14" />
              {!musicEnabled ? (
                <VolumeX
                  strokeWidth={1.5}
                  className="relative z-[9999999] h-5 w-5 text-white/90 md:h-8 md:w-8"
                />
              ) : (
                <Volume2
                  strokeWidth={1.5}
                  className="relative z-[9999999] h-5 w-5 text-white/90 md:h-8 md:w-8"
                />
              )}
            </button>

            {/* Magnetic text – shown with smooth entry/exit */}
            {showMagneticText && (
              <div
                ref={magneticTextRef}
                className="pointer-events-none absolute rounded-full border border-white/20 bg-white/10 px-4 py-2 font-mono text-sm tracking-wider whitespace-nowrap text-white backdrop-blur-md"
                style={{
                  left: 0,
                  top: 0,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0,
                }}
              >
                ENTER WITH MUSIC
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom brand */}
      <div className="absolute bottom-5 left-1/2 z-[999999] -translate-x-1/2 text-center md:bottom-10">
        <h1 className="font-ops text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] md:text-8xl">
          KIRITO
        </h1>
        <div className="mx-auto mt-3 h-px w-40 bg-gradient-to-r from-transparent via-white/70 to-transparent md:mt-4 md:w-64" />
        <p className="mt-3 font-mono text-[8px] tracking-[0.3em] text-white/50 uppercase md:mt-5 md:text-[10px] md:tracking-[0.5em]">
          {'// '} ROOT://BLOG_SHELL {'// '}
        </p>
      </div>

      {/* CSS keyframes */}
      <style jsx>{`
        @keyframes dataStream {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        @keyframes floatParticle {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(12px, -12px);
          }
        }
        @keyframes glitch {
          0%,
          100% {
            transform: skew(0deg, 0deg);
            opacity: 1;
          }
          10% {
            transform: skew(1.5deg, 0.8deg);
            opacity: 0.9;
          }
          20% {
            transform: skew(-1.5deg, -0.8deg);
            opacity: 0.95;
          }
          30% {
            transform: skew(0.5deg, 0deg);
            opacity: 1;
          }
        }
        .animate-glitch {
          animation: glitch 0.12s ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
