'use client';
import { signOut } from 'next-auth/react';
import { useRef } from 'react';
import type { CSSProperties } from 'react';

export default function SignOut() {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const applyEnter = () => {
    const btn = btnRef.current;
    if (!btn) return;

    btn.style.setProperty('--cut', '0px');
    btn.style.transform = 'scale(0.92)';

    // 🔥 restart shine animation manually
    const shines = btn.querySelectorAll('.shine');
    shines.forEach((el) => {
      el.classList.remove('run');
      void (el as HTMLElement).offsetWidth; // force reflow
      el.classList.add('run');
    });
  };

  const applyLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;

    btn.style.setProperty('--cut', '14px');
    btn.style.transform = 'scale(1)';
  };

  return (
    <div
      onMouseEnter={applyEnter}
      onMouseLeave={() => {
        applyLeave();
      }}
      className="cursor-pointer border-red-500 py-1 hover:border"
      style={{
        clipPath:
          'polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px)',
      }}
    >
      <button
        onClick={() => signOut()}
        ref={btnRef}
        className="relative cursor-pointer overflow-hidden px-8 py-2 font-semibold tracking-wide text-white"
        style={
          {
            '--cut': '14px',
            clipPath:
              'polygon(var(--cut) 0%, 100% 0%, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0% 100%, 0% var(--cut))',
            transition: 'clip-path 1s ease, transform 1s ease',
            background: 'black',
            transform: 'scale(1)',
          } as CSSProperties
        }
      >
        {/* Border */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath:
              'polygon(var(--cut) 0%, 100% 0%, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0% 100%, 0% var(--cut))',
            border: '1px solid white',
          }}
        />

        {/* Shine layers */}
        <span className="shine white" />
        <span className="shine blue" />
        <span className="shine red" />

        <span className="relative z-10 flex items-center justify-between gap-2 py-1 text-sm">
          {/* GitHub Icon */}

          <span>Sign Out</span>
        </span>

        <style jsx>{`
          .shine {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
          }

          .shine::before {
            content: '';
            position: absolute;
            top: 0;
            left: -120%;
            width: 50%;
            height: 100%;
            transform: skewX(-20deg);
          }

          .white::before {
            background: white;
          }

          .blue::before {
            background: #3b82f6;
          }

          .red::before {
            background: #ef4444;
          }

          /* 👇 only runs when JS adds .run */
          .run.white::before {
            animation: shine 0.8s ease;
          }

          .run.blue::before {
            animation: shine 0.8s ease;
            animation-delay: 0.1s;
          }

          .run.red::before {
            animation: shine 0.8s ease;
            animation-delay: 0.2s;
          }

          @keyframes shine {
            0% {
              left: -120%;
            }
            100% {
              left: 120%;
            }
          }
        `}</style>
      </button>
    </div>
  );
}
