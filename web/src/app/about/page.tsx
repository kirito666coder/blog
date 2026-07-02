'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SpanBox } from './components/SpanBox';
import { ScrollMarquee } from './components/ScrollMarquee';
import { Footer } from './components/Footer';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);

  const bentoCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const arsenalNodesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Initial Load Reveal (Hero)
      gsap.from(heroTextRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.2,
      });

      gsap.from(heroImageRef.current, {
        scale: 1.1,
        opacity: 0,
        duration: 2,
        ease: 'power3.out',
        delay: 0.4,
      });

      // 2. Mouse Parallax (Hero)
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const xPos = (e.clientX / innerWidth - 0.5) * 2;
        const yPos = (e.clientY / innerHeight - 0.5) * 2;

        gsap.to(heroBgRef.current, {
          x: xPos * 40,
          y: yPos * 40,
          duration: 1,
          ease: 'power2.out',
        });

        gsap.to(heroImageRef.current, {
          x: xPos * -20,
          y: yPos * -20,
          duration: 1,
          ease: 'power2.out',
        });
      };
      window.addEventListener('mousemove', handleMouseMove);

      // 3. Scroll-Linked Entrance (Bento Grid)
      gsap.from(bentoCardsRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: bentoCardsRef.current[0],
          start: 'top 85%',
        },
      });

      // 4. Interactive Timeline Entrance
      gsap.from(timelineNodesRef.current, {
        x: -50,
        opacity: 0,
        duration: 1,
        stagger: 0.25,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: timelineNodesRef.current[0],
          start: 'top 85%',
        },
      });

      // Timeline Light Up Effect
      timelineNodesRef.current.forEach((node) => {
        const dot = node?.querySelector('.timeline-dot');
        if (dot) {
          gsap.to(dot, {
            scale: 1.3,
            boxShadow: '0 0 20px rgba(255,255,255,0.8)',
            backgroundColor: 'var(--foreground)',
            duration: 0.4,
            scrollTrigger: {
              trigger: node,
              start: 'top 60%',
              end: 'bottom 40%',
              toggleActions: 'play reverse play reverse',
            },
          });
        }
      });

      // 5. Magnetic Button Interaction
      const magneticBtn = document.querySelector('.magnetic-btn');
      if (magneticBtn) {
        const moveBtn = (e: any) => {
          const rect = magneticBtn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(magneticBtn, {
            x: x * 0.4,
            y: y * 0.4,
            duration: 0.5,
            ease: 'power3.out',
          });
        };
        const leaveBtn = () => {
          gsap.to(magneticBtn, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.3)',
          });
        };
        magneticBtn.addEventListener('mousemove', moveBtn);
        magneticBtn.addEventListener('mouseleave', leaveBtn);
      }

      // 6. Floating Tech Nodes
      arsenalNodesRef.current.forEach((node) => {
        gsap.to(node, {
          y: 'random(-30, 30)',
          x: 'random(-30, 30)',
          duration: 'random(3, 5)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-background text-foreground selection:bg-foreground selection:text-background min-h-screen w-full"
    >
      {/* HERO SECTION */}
      <section className="bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden">
        {/* Background Grid Pattern & Giant Typography */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05]">
          <h1 className="font-display text-[20vw] leading-none whitespace-nowrap">
            ABOUT ME
          </h1>
        </div>

        {/* Central Content Container */}
        <div className="relative z-10 flex h-full w-full max-w-screen-2xl flex-col items-center justify-between px-6 pt-24 md:flex-row md:px-12 md:pt-0">
          {/* Left: Text & Info */}
          <div className="relative z-20 flex w-full flex-col items-start md:w-1/2">
            <div className="mb-6 flex items-center gap-4">
              <span className="bg-foreground/50 h-px w-12"></span>
              <span className="text-foreground/70 text-sm font-medium tracking-[0.3em] uppercase">
                Introduction
              </span>
            </div>

            <h2
              ref={heroTextRef}
              className="font-display mb-8 text-6xl leading-[0.9] tracking-tighter sm:text-8xl lg:text-[7rem]"
            >
              Creative <br />
              <span className="text-transparent [-webkit-text-stroke:2px_var(--foreground)]">
                Developer
              </span>
            </h2>

            <p className="text-foreground/70 mb-10 max-w-md text-lg leading-relaxed font-light md:text-xl">
              Merging cutting-edge engineering with bold, experimental
              aesthetics to build unforgettable digital experiences.
            </p>

            <div className="flex gap-4">
              <a
                href="#connect"
                className="border-foreground/20 bg-foreground/5 text-foreground hover:bg-foreground hover:text-background rounded-full border px-8 py-4 text-sm tracking-widest uppercase backdrop-blur-md transition-all duration-300"
              >
                Explore Work
              </a>
            </div>
          </div>

          {/* Right: Character Image with Geometric Backdrop */}
          <div
            ref={heroBgRef}
            className="relative z-10 mt-16 flex h-[60vh] w-full items-end justify-center md:mt-0 md:h-[85vh] md:w-1/2"
          >
            {/* Geometric accents */}
            <div className="border-foreground/10 absolute top-1/2 left-1/2 h-[70vw] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full border md:h-[40vw] md:w-[40vw]" />
            <div className="border-foreground/20 absolute top-1/2 left-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 animate-[spin_60s_linear_infinite] rounded-full border border-dashed md:h-[30vw] md:w-[30vw]" />

            {/* The Image */}
            <div ref={heroImageRef} className="relative z-20 h-full w-full">
              <Image
                src="/images/Doma.png"
                alt="Kirito"
                fill
                className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-transform duration-[2000ms] hover:scale-105 dark:drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="border-foreground/40 absolute top-6 left-6 h-4 w-4 border-t-2 border-l-2 md:top-10 md:left-10"></div>
        <div className="border-foreground/40 absolute top-6 right-6 h-4 w-4 border-t-2 border-r-2 md:top-10 md:right-10"></div>
        <div className="border-foreground/40 absolute bottom-6 left-6 h-4 w-4 border-b-2 border-l-2 md:bottom-10 md:left-10"></div>
        <div className="border-foreground/40 absolute right-6 bottom-6 h-4 w-4 border-r-2 border-b-2 md:right-10 md:bottom-10"></div>
      </section>

      {/* SCROLL MARQUEE SECTION */}
      <section className="border-border/20 bg-background w-full overflow-hidden border-y py-12 md:py-20">
        <ScrollMarquee
          text="KIRITO"
          direction={-1}
          textClassName="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[15rem]"
        />
      </section>

      {/* NEW CONTENT SECTION */}
      <section className="bg-background relative z-40 flex w-full flex-col gap-24 overflow-hidden px-6 py-24 md:px-20 lg:px-40">
        {/* Decorative Grid Background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative flex flex-col items-start justify-between gap-16 md:flex-row">
          <h2 className="font-display w-full text-5xl leading-[1.1] tracking-tighter md:w-1/3 md:text-7xl lg:text-8xl">
            Crafting{' '}
            <span className="text-muted-foreground font-sans font-light italic">
              digital
            </span>{' '}
            realms.
          </h2>
          <div className="text-foreground/70 flex w-full flex-col gap-8 text-lg leading-relaxed font-light md:w-1/2 md:text-2xl">
            <p>
              I bridge the gap between exceptional design and robust
              engineering. My journey began with curiosity and evolved into a
              deep appreciation for the web&apos;s infinite canvas.
            </p>
            <p>
              Specializing in immersive, interactive, and highly performant
              applications that leave a lasting impression. When I&apos;m not
              writing code, I&apos;m exploring new aesthetic paradigms and
              experimental UI techniques.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="relative grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          <div
            ref={(el) => {
              bentoCardsRef.current[0] = el;
            }}
            className="from-border/40 to-border/10 border-border/50 group hover:border-foreground/30 relative col-span-1 flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-10 transition-all duration-500 md:col-span-2"
          >
            <div className="bg-foreground/5 group-hover:bg-foreground/10 absolute top-0 right-0 h-64 w-64 translate-x-1/4 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-500" />

            <h3 className="font-display text-foreground relative z-10 mb-10 text-3xl md:text-5xl">
              Philosophy
            </h3>
            <p className="text-foreground/70 relative z-10 max-w-xl text-xl md:text-2xl">
              Code is poetry. Design is the emotion it evokes. I believe in
              minimalism where possible, and complexity where necessary. Every
              pixel should have a purpose.
            </p>
            <div className="relative z-10 mt-12 flex gap-3">
              <div className="bg-foreground h-1.5 w-12 rounded-full" />
              <div className="bg-foreground/30 h-1.5 w-2 rounded-full" />
              <div className="bg-foreground/30 h-1.5 w-2 rounded-full" />
            </div>
          </div>

          <div
            ref={(el) => {
              bentoCardsRef.current[1] = el;
            }}
            className="bg-border/20 border-border/50 group hover:bg-border/30 hover:border-foreground/30 relative col-span-1 flex flex-col items-center justify-center overflow-hidden rounded-3xl border p-8 text-center transition-all duration-500"
          >
            <div className="from-foreground/5 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h4 className="font-ops text-foreground/80 group-hover:text-foreground relative z-10 mb-4 text-4xl transition-colors md:text-5xl">
              Tech
            </h4>
            <p className="text-foreground/60 relative z-10 text-lg">
              React, Next.js, Tailwind, WebGL, GSAP, TypeScript
            </p>
          </div>

          <div
            ref={(el) => {
              bentoCardsRef.current[2] = el;
            }}
            className="bg-border/20 border-border/50 group hover:bg-border/30 hover:border-foreground/30 relative col-span-1 flex flex-col items-center justify-center overflow-hidden rounded-3xl border p-8 text-center transition-all duration-500"
          >
            <div className="from-foreground/5 absolute inset-0 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h4 className="font-ops text-foreground/80 group-hover:text-foreground relative z-10 mb-4 text-4xl transition-colors md:text-5xl">
              Design
            </h4>
            <p className="text-foreground/60 relative z-10 text-lg">
              Figma, Motion, UI/UX, Typography, 3D Modeling
            </p>
          </div>

          <div
            ref={(el) => {
              bentoCardsRef.current[3] = el;
            }}
            className="bg-foreground text-background group relative col-span-1 flex flex-col items-center justify-between overflow-hidden rounded-3xl p-10 md:col-span-2 md:flex-row"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:-200%_0,0_0] hover:duration-[1500ms]" />
            <div className="relative z-10">
              <h3 className="font-display mb-2 text-3xl md:text-5xl">
                Let&apos;s Connect
              </h3>
              <p className="text-background/70 text-lg">
                Open for freelance opportunities and collaborations.
              </p>
            </div>
            <a
              href="mailto:hello@example.com"
              className="magnetic-btn bg-background text-foreground relative z-10 mt-8 rounded-full px-8 py-4 text-lg font-medium whitespace-nowrap md:mt-0"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* EXPERIENCE / TIMELINE SECTION */}
      <section className="bg-background border-border/10 relative w-full border-t px-6 py-24 md:px-20 lg:px-40">
        <div className="mb-16 flex flex-col items-center justify-between gap-8 md:flex-row">
          <h2 className="font-display text-5xl md:text-7xl">
            The{' '}
            <span className="text-transparent [-webkit-text-stroke:2px_var(--foreground)]">
              Journey
            </span>
          </h2>
          <p className="text-foreground/60 max-w-md text-lg">
            A chronological timeline of my professional experience, continuous
            learning, and major milestones.
          </p>
        </div>

        <div className="border-border/30 relative ml-4 space-y-16 border-l pl-8 md:ml-6 md:pl-12">
          {/* Timeline Item 1 */}
          <div
            ref={(el) => {
              timelineNodesRef.current[0] = el;
            }}
            className="relative"
          >
            <div className="timeline-dot bg-foreground border-background absolute top-1.5 -left-[2.85rem] h-6 w-6 rounded-full border-4 shadow-[0_0_15px_rgba(255,255,255,0.5)] md:-left-[3.85rem]"></div>
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
              <span className="font-ops text-2xl tracking-widest md:text-3xl">
                2024 — PRESENT
              </span>
              <span className="text-foreground/40 hidden md:inline">•</span>
              <span className="text-xl font-medium">
                Senior Frontend Engineer
              </span>
            </div>
            <h3 className="text-foreground/80 mb-4 text-xl">
              Tech Innovations Inc.
            </h3>
            <p className="text-foreground/60 max-w-2xl leading-relaxed">
              Leading the frontend architecture for next-generation web
              applications. Spearheading the migration to Next.js 14 and
              implementing complex WebGL features for immersive user
              experiences.
            </p>
          </div>

          {/* Timeline Item 2 */}
          <div
            ref={(el) => {
              timelineNodesRef.current[1] = el;
            }}
            className="relative"
          >
            <div className="timeline-dot bg-foreground/50 border-background absolute top-1.5 -left-[2.85rem] h-6 w-6 rounded-full border-4 md:-left-[3.85rem]"></div>
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
              <span className="font-ops text-foreground/70 text-2xl tracking-widest md:text-3xl">
                2021 — 2024
              </span>
              <span className="text-foreground/40 hidden md:inline">•</span>
              <span className="text-xl font-medium">Full Stack Developer</span>
            </div>
            <h3 className="text-foreground/80 mb-4 text-xl">
              Creative Digital Agency
            </h3>
            <p className="text-foreground/60 max-w-2xl leading-relaxed">
              Developed and maintained multiple high-traffic e-commerce
              platforms. Specialized in creating fluid animations using GSAP and
              building robust scalable backends with Node.js.
            </p>
          </div>

          {/* Timeline Item 3 */}
          <div
            ref={(el) => {
              timelineNodesRef.current[2] = el;
            }}
            className="relative"
          >
            <div className="timeline-dot bg-foreground/20 border-background absolute top-1.5 -left-[2.85rem] h-6 w-6 rounded-full border-4 md:-left-[3.85rem]"></div>
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
              <span className="font-ops text-foreground/50 text-2xl tracking-widest md:text-3xl">
                2019 — 2021
              </span>
              <span className="text-foreground/40 hidden md:inline">•</span>
              <span className="text-xl font-medium">Junior Web Developer</span>
            </div>
            <h3 className="text-foreground/80 mb-4 text-xl">Startup Studio</h3>
            <p className="text-foreground/60 max-w-2xl leading-relaxed">
              Began professional journey building responsive landing pages,
              optimizing web performance, and learning the fundamentals of UI/UX
              design.
            </p>
          </div>
        </div>
      </section>

      {/* ARSENAL / TECH SECTION */}
      <section className="bg-foreground text-background relative w-full overflow-hidden px-6 py-24 md:px-20 lg:px-40">
        <div className="relative z-10 flex flex-col items-center justify-between gap-16 md:flex-row">
          <div className="w-full md:w-1/2">
            <h2 className="font-display mb-6 text-5xl md:text-7xl">
              The{' '}
              <span className="text-transparent [-webkit-text-stroke:2px_var(--background)]">
                Arsenal
              </span>
            </h2>
            <p className="text-background/70 mb-8 max-w-md text-lg leading-relaxed">
              My toolkit consists of industry-leading frameworks and libraries,
              allowing me to build robust, scalable, and visually stunning
              applications.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                'TypeScript',
                'React',
                'Next.js',
                'Tailwind',
                'Three.js',
                'GSAP',
                'Node.js',
                'Figma',
              ].map((tech) => (
                <span
                  key={tech}
                  className="border-background/20 bg-background/5 rounded-full border px-4 py-2 text-sm tracking-wider uppercase backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-full justify-center md:w-1/2 md:justify-end">
            <div className="relative h-64 w-64 md:h-96 md:w-96">
              {/* Concentric rotating circles for a radar/tech feel */}
              <div className="border-background/10 absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border" />
              <div className="border-background/20 absolute inset-4 animate-[spin_30s_linear_infinite_reverse] rounded-full border border-dashed" />
              <div className="border-background/10 absolute inset-12 animate-[spin_40s_linear_infinite] rounded-full border" />
              <div className="border-background/30 absolute inset-20 animate-[spin_50s_linear_infinite_reverse] rounded-full border border-dotted" />

              <div className="bg-background absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]" />

              {/* Floating Tech Nodes */}
              <div
                ref={(el) => {
                  arsenalNodesRef.current[0] = el;
                }}
                className="bg-background/80 absolute top-[10%] left-[20%] h-3 w-3 rounded-full"
              />
              <div
                ref={(el) => {
                  arsenalNodesRef.current[1] = el;
                }}
                className="bg-background/60 absolute right-[10%] bottom-[20%] h-2 w-2 rounded-full"
              />
              <div
                ref={(el) => {
                  arsenalNodesRef.current[2] = el;
                }}
                className="bg-background/40 absolute top-[30%] right-[20%] h-4 w-4 rounded-full"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
