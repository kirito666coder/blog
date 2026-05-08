'use client';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';

type CutCornerButtonProps = {
  text: string;
  url?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function CutCornerButton({
  text,
  url = '',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
}: CutCornerButtonProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  const isLink = !!url;
  const isActive = pathname === url;

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

  useEffect(() => {
    if (isActive) applyEnter();
    else applyLeave();
  }, [isActive]);

  const ButtonElement = (
    <div
      onMouseEnter={applyEnter}
      onMouseLeave={() => {
        if (!isActive) applyLeave();
      }}
      className={`cursor-pointer py-1.5 hover:border ${isActive ? 'border' : ''} ${className}`}
      style={{
        clipPath:
          'polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px)',
      }}
    >
      <button
        onClick={onClick}
        type={type}
        disabled={disabled}
        ref={btnRef}
        className="relative cursor-pointer overflow-hidden px-8 py-2 font-semibold tracking-wide"
        style={
          {
            '--cut': isActive ? '0px' : '14px',
            clipPath:
              'polygon(var(--cut) 0%, 100% 0%, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0% 100%, 0% var(--cut))',
            transition: 'clip-path 1s ease, transform 1s ease',
            background: 'black',
            transform: isActive ? 'scale(0.92)' : 'scale(1)',
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

        {/* Text */}
        <span className="relative z-10 text-sm">{text}</span>

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

  if (isLink) {
    return <Link href={url}>{ButtonElement}</Link>;
  }

  return ButtonElement;
}
