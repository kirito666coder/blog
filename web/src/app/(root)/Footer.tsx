import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background relative flex h-screen w-full flex-col items-center justify-between overflow-hidden pt-20">
      {/* Top Section - Links & Info */}
      <div className="z-10 flex w-full max-w-6xl flex-col items-center justify-between gap-8 px-6 md:flex-row md:items-start lg:px-12">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <div className="border-border/50 bg-foreground/5 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md">
            <span className="bg-foreground h-2 w-2 animate-pulse rounded-full" />
            <span className="text-foreground text-xs font-bold tracking-wider uppercase">
              Open to opportunities
            </span>
          </div>
          <p className="text-muted-foreground max-w-sm text-center font-medium md:text-left">
            Crafting digital experiences with precision and passion. Let&apos;s
            build something amazing together.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:justify-end">
          <div className="flex flex-col gap-2">
            <span className="text-foreground mb-2 text-sm font-black tracking-widest uppercase">
              Navigation
            </span>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/blogs"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Blogs
            </Link>
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Admin
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-foreground mb-2 text-sm font-black tracking-widest uppercase">
              Socials
            </span>
            <a
              href="https://github.com/kirito666coder"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Twitter / X
            </a>
            <a
              href="https://github.com/kirito666coder"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/kirito666coder"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Massive Typography Bottom */}
      <div className="pointer-events-none absolute bottom-0 flex w-full items-end justify-center overflow-hidden leading-none select-none">
        <h1 className="footer-text font-display text-foreground mb-[-2vw] text-[25vw] leading-[0.8] font-black tracking-tighter uppercase">
          KIRITO
        </h1>
      </div>

      {/* Copyright */}
      <div className="absolute bottom-6 z-10 w-full text-center">
        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} Kirito. Released under the MIT License.
        </p>
      </div>
    </footer>
  );
}
