'use client';

import { useState } from 'react';

const skills = [
  {
    name: 'React',
    x: '20%',
    y: '30%',
    level: 'Advanced',
    projects: '24 Projects',
  },

  {
    name: 'Next.js',
    x: '70%',
    y: '25%',
    level: 'Expert',
    projects: '18 Projects',
  },

  {
    name: 'TypeScript',
    x: '45%',
    y: '50%',
    level: 'Expert',
    projects: '30 Projects',
  },

  {
    name: 'GSAP',
    x: '25%',
    y: '75%',
    level: 'Advanced',
    projects: '15 Projects',
  },

  {
    name: 'Three.js',
    x: '75%',
    y: '70%',
    level: 'Intermediate',
    projects: '10 Projects',
  },

  {
    name: 'Node.js',
    x: '55%',
    y: '80%',
    level: 'Advanced',
    projects: '20 Projects',
  },
];

export function SkillsConstellation() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-20">
        <h2 className="mb-6 text-[clamp(2.5rem,6vw,5rem)] leading-none font-bold tracking-[-0.05em]">
          The
          <span className="text-black/40">Arsenal</span>
        </h2>

        <p className="max-w-xl text-lg leading-relaxed text-black/60">
          Technologies and tools used to build scalable, high-performance
          digital products.
        </p>
      </div>

      <div className="relative h-[700px] overflow-hidden rounded-[40px] border border-black/10 bg-black/[0.02]">
        {/* connection lines */}

        <svg className="absolute inset-0 h-full w-full">
          <line
            x1="20%"
            y1="30%"
            x2="45%"
            y2="50%"
            stroke="rgba(0,0,0,.15)"
            strokeWidth="2"
          />

          <line
            x1="45%"
            y1="50%"
            x2="70%"
            y2="25%"
            stroke="rgba(0,0,0,.15)"
            strokeWidth="2"
          />

          <line
            x1="45%"
            y1="50%"
            x2="25%"
            y2="75%"
            stroke="rgba(0,0,0,.15)"
            strokeWidth="2"
          />

          <line
            x1="45%"
            y1="50%"
            x2="75%"
            y2="70%"
            stroke="rgba(0,0,0,.15)"
            strokeWidth="2"
          />

          <line
            x1="75%"
            y1="70%"
            x2="55%"
            y2="80%"
            stroke="rgba(0,0,0,.15)"
            strokeWidth="2"
          />
        </svg>

        {skills.map((skill, index) => (
          <div
            key={skill.name}
            style={{
              left: skill.x,
              top: skill.y,
            }}
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          >
            <div
              className={`rounded-full border border-black/10 bg-white px-6 py-4 shadow-xl backdrop-blur-xl transition-all duration-500 ${
                active === index ? 'scale-125' : 'scale-100'
              } `}
            >
              <div className="font-medium">{skill.name}</div>

              {active === index && (
                <div className="animate-in fade-in mt-3 space-y-1 duration-300">
                  <p className="text-sm text-black/60">{skill.level}</p>

                  <p className="text-sm text-black/40">{skill.projects}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
