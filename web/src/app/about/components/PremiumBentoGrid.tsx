'use client';

import { useEffect, useRef } from 'react';

const cards = [
  {
    title: 'Philosophy',
    description:
      'Design should feel invisible. Every interaction must reduce friction while creating emotion.',
    large: true,
  },

  {
    title: 'Tech Stack',
    description: 'Next.js • React • TypeScript • GSAP • Three.js',
  },

  {
    title: 'Design',
    description: 'UI/UX • Motion • Typography • Systems',
  },

  {
    title: 'Collaboration',
    description: 'Open for freelance projects and creative partnerships.',
    large: true,
  },
];

export function PremiumBentoGrid() {
  return (
    <div>
      <div className="mb-20">
        <h2 className="mb-5 text-[clamp(2.5rem,6vw,5rem)] leading-none font-bold tracking-[-0.05em]">
          Crafting
          <span className="text-white/40"> Digital </span>
          Experiences
        </h2>

        <p className="max-w-2xl text-lg leading-relaxed text-white/60">
          A balance of engineering precision and visual storytelling, focused on
          creating memorable products.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card, index) => (
          <SpotlightCard
            key={index}
            title={card.title}
            description={card.description}
            large={card.large}
          />
        ))}
      </div>
    </div>
  );
}

type CardProps = {
  title: string;
  description: string;
  large?: boolean;
};

function SpotlightCard({ title, description, large }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--x', `${x}px`);

      card.style.setProperty('--y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMove);

    return () => {
      card.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-[36px] border border-white/[0.08] bg-white/[0.03] p-10 shadow-[0_0_40px_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-2 hover:scale-[1.02] hover:border-white/20 ${large ? 'min-h-[300px] md:col-span-2' : 'min-h-[300px]'} `}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(255,255,255,.18),transparent_40%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <h3 className="mb-6 text-3xl font-bold tracking-tight">{title}</h3>

          <p className="max-w-lg text-lg leading-relaxed text-white/60">
            {description}
          </p>
        </div>

        <div className="mt-10 flex gap-2">
          <div className="h-[4px] w-12 rounded-full bg-white" />

          <div className="h-[4px] w-2 rounded-full bg-white/30" />

          <div className="h-[4px] w-2 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}
