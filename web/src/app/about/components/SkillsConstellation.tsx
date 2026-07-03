export function SkillsConstellation() {
  return (
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
      </div>
    </section>
  );
}
