import Link from 'next/link';

import { BlogContent } from './BlogContent';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Blog } from '@/models/blog.schema';

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-ops mt-12 mb-6 text-4xl font-bold tracking-tight md:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => <h2 className="mt-10 mb-4 text-2xl font-bold md:text-3xl">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 mb-3 text-xl font-semibold md:text-2xl">{children}</h3>,
  p: ({ children }) => (
    <p className="text-muted-foreground mb-4 text-lg leading-relaxed">{children}</p>
  ),
  li: ({ children }) => <li className="text-muted-foreground my-2 ml-6 list-disc">{children}</li>,

  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || '');

    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          className="rounded-xl !bg-neutral-900 p-4 text-sm"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }

    return <code className="rounded bg-white/10 px-1 py-0.5 text-sm">{children}</code>;
  },
};

export default function BlogDetailClient({ blog }: { blog: Blog }) {
  return (
    <article className="bg-background relative flex min-h-screen flex-col items-center px-6 pt-32 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[50%] h-[50%] w-[50%] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[150px]" />
      </div>

      <div className="w-full max-w-4xl">
        <Link
          href="/blogs"
          className="group text-muted-foreground mb-12 flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          BACK TO BLOGS
        </Link>

        <header className="mb-16">
          <div className="mb-6 flex items-center gap-4">
            <span className="rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
              {blog.category}
            </span>
            <span className="text-muted-foreground text-xs tracking-widest uppercase">
              • 5 MIN READ
            </span>
          </div>

          <h1 className="font-ops mb-8 text-4xl leading-tight font-extrabold tracking-tighter md:text-6xl lg:text-7xl">
            {blog.title}
          </h1>

          <p className="text-muted-foreground border-l-4 border-blue-500/30 py-2 pl-6 text-xl leading-relaxed italic">
            {blog.excerpt}
          </p>
        </header>

        <div className="prose prose-invert max-w-none">
          <BlogContent>
            <ReactMarkdown components={markdownComponents}>
              {blog.content.replace(/\\`\\`\\`/g, '```').replace(/\\n/g, '\n')}
            </ReactMarkdown>
          </BlogContent>
        </div>

        <footer className="mt-20 border-t border-white/5 pt-10">
          <div className="flex flex-wrap gap-3">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="glass text-muted-foreground rounded-lg px-3 py-1 font-mono text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}
