import { blogs } from '@/data/blogs';
import { Navigation } from '@/components/Navigation';
import { CodeBlock } from '@/components/CodeBlock';
import { notFound } from 'next/navigation';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground selection:bg-foreground selection:text-background min-h-screen">
      <Navigation />

      <main className="mx-auto max-w-4xl px-6 py-20 lg:py-32">
        <Link
          href="/"
          className="group text-muted-foreground hover:text-foreground mb-12 flex items-center gap-2 text-sm font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to all blogs
        </Link>

        <article>
          <header className="mb-16 flex flex-col gap-6">
            <div className="text-muted-foreground flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                {blog.category}
              </span>
              <div className="bg-foreground/20 h-1 w-1 rounded-full" />
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {blog.date}
              </span>
            </div>

            <h1 className="font-display text-4xl leading-tight tracking-tighter text-balance md:text-6xl lg:text-7xl">
              {blog.title}
            </h1>

            <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed italic">
              {blog.description}
            </p>
          </header>

          <div className="prose prose-invert max-w-none">
            <div className="text-muted-foreground space-y-6 text-lg leading-relaxed">
              {blog.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph.trim()}</p>
              ))}
            </div>

            {blog.codeSnippet && (
              <CodeBlock code={blog.codeSnippet.code} language={blog.codeSnippet.language} />
            )}
          </div>
        </article>

        <section className="border-border/40 mt-32 border-t py-20">
          <h2 className="font-display mb-8 text-3xl">Newsletter</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Get the latest experiments and architectural deep-dives directly in your inbox.
          </p>
          <div className="flex max-w-md gap-4">
            <input
              type="email"
              placeholder="Email address"
              className="bg-accent border-border/40 focus:ring-foreground flex-1 rounded-full border px-6 py-3 text-sm transition-all focus:ring-2 focus:outline-none"
            />
            <button className="bg-foreground text-background rounded-full px-8 py-3 font-bold transition-opacity hover:opacity-90">
              Join
            </button>
          </div>
        </section>
      </main>

      <footer className="border-border/40 border-t px-6 py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="font-ops text-2xl tracking-tighter">KIRITO.BLOG</div>
          <p className="text-muted-foreground/60 text-xs">
            © 2026 Kirito Blog. Built with precision.
          </p>
        </div>
      </footer>
    </div>
  );
}
