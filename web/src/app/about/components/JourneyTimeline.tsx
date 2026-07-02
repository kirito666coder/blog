'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const timeline = [
  {
    year: '2024',
    role: 'Senior Frontend Engineer',
    company: 'Tech Innovations',
    description: 'Led frontend architecture and immersive web experiences.',
  },

  {
    year: '2021',
    role: 'Full Stack Developer',
    company: 'Creative Agency',
    description: 'Built scalable products and advanced motion systems.',
  },

  {
    year: '2019',
    role: 'Junior Developer',
    company: 'Startup Studio',
    description:
      'Focused on performance, responsive systems, and UI foundations.',
  },
];

export function JourneyTimeline() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(lineRef.current, {
        scaleY: 1,

        ease: 'none',

        scrollTrigger: {
          trigger: '.timeline-container',

          start: 'top 20%',
          end: 'bottom 80%',
          scrub: 1,
        },
      });

      gsap.from('.timeline-card', {
        y: 80,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power4.out',

        scrollTrigger: {
          trigger: '.timeline-container',
          start: 'top 80%',
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="timeline-container relative">
      <div className="mb-20">
        <h2 className="mb-6 text-[clamp(2.5rem,6vw,5rem)] leading-none font-bold tracking-[-0.05em]">
          The
          <span className="text-white/40">Journey</span>
        </h2>

        <p className="max-w-xl text-lg text-white/60">
          Professional milestones and experiences shaping my journey.
        </p>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/10" />

        <div
          ref={lineRef}
          className="absolute top-0 left-1/2 h-full w-[2px] origin-top -translate-x-1/2 scale-y-0 bg-white"
        />

        <div className="space-y-24">
          {timeline.map((item, index) => (
            <div
              key={index}
              className={`timeline-card relative flex items-center ${
                index % 2 === 0 ? 'justify-start' : 'justify-end'
              } `}
            >
              <div className="absolute top-1/2 left-1/2 z-20 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#070707] bg-white shadow-[0_0_30px_rgba(255,255,255,.6)]" />

              <div className="w-full rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_0_40px_rgba(255,255,255,.03)] backdrop-blur-xl md:w-[45%]">
                <div className="mb-4 text-sm tracking-[0.3em] text-white/40 uppercase">
                  {item.year}
                </div>

                <h3 className="mb-2 text-2xl font-semibold">{item.role}</h3>

                <h4 className="mb-5 text-white/50">{item.company}</h4>

                <p className="leading-relaxed text-white/60">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
