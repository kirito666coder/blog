'use client';

import { Code2, Layers, Globe, Cpu } from 'lucide-react';

const techStack = [
  { icon: Code2, label: 'TypeScript' },
  { icon: Layers, label: 'MERN' },
  { icon: Globe, label: 'Next.js' },
  { icon: Cpu, label: 'Node.js' },
];

function TechGroup({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="flex flex-none items-center gap-8 px-4"
      aria-hidden={hidden ? 'true' : undefined}
    >
      {techStack.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon size={24} />
          <span className="text-xl font-bold uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function CoreStackCard() {
  return (
    <div className="bento-card bg-foreground/5 border-border/50 hover:border-foreground/30 hover:bg-foreground/10 relative flex flex-col justify-center overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl transition-all md:col-span-2 md:row-span-1 lg:p-8">
      <h3 className="text-muted-foreground absolute top-6 left-6 text-sm font-bold tracking-widest uppercase lg:left-8">
        Core Stack
      </h3>

      <div
        className="tech-marquee-mask pointer-events-none relative mt-6 flex w-full overflow-hidden"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          maskImage:
            'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        {/* w-max, NOT min-w-full — track must shrink-wrap to its real content
            width so translateX(-50%) always lands exactly on the seam */}
        <div className="tech-marquee-content flex w-max items-center gap-8 whitespace-nowrap">
          <TechGroup />
          <TechGroup hidden />
        </div>
      </div>

      <style jsx>{`
        @keyframes tech-marquee {
          from {
            transform: translate3d(0%, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .tech-marquee-content {
          animation: tech-marquee 20s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }

        .tech-marquee-mask:hover .tech-marquee-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
