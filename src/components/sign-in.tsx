'use client';
import { signIn } from 'next-auth/react';
import { useRef } from 'react';
import type { CSSProperties } from 'react';

export default function CutCornerButton() {
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
      className="cursor-pointer border-white py-1.5 hover:border"
      style={{
        clipPath:
          'polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px)',
      }}
    >
      <button
        onClick={() => signIn('github')}
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

        <span className="relative z-10 flex items-center justify-between gap-2 py-px text-sm">
          {/* GitHub Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.38-3.88-1.38-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.21 1.8 1.21 1.04 1.79 2.73 1.27 3.39.97.1-.76.41-1.27.75-1.56-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.2-3.07-.12-.3-.52-1.52.11-3.16 0 0 .97-.31 3.18 1.17a11.1 11.1 0 0 1 5.8 0c2.2-1.48 3.17-1.17 3.17-1.17.64 1.64.24 2.86.12 3.16.75.8 1.2 1.82 1.2 3.07 0 4.4-2.7 5.36-5.27 5.64.42.36.8 1.08.8 2.18 0 1.58-.01 2.86-.01 3.25 0 .3.2.66.79.55A11.51 11.51 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
          </svg>
          <span>GitHub</span>
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
