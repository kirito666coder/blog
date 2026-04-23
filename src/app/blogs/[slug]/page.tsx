import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dummyBlogs } from '@/data/blogs';
import { CodeBlock } from '@/components/CodeBlock';
import Link from 'next/link';

import { BlogContent } from './BlogContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return dummyBlogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = dummyBlogs.find((b) => b.slug === slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
    };
  }

  return {
    title: `${blog.seo.metaTitle} | Kirito Blog`,
    description: blog.seo.metaDescription,
    keywords: blog.seo.keywords,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = dummyBlogs.find((b) => b.slug === slug);

  if (!blog) {
    notFound();
  }

  // Simple Markdown Parser (Lite)
  const renderContent = (content: string) => {
    const sections = content.split(/(\`\`\`[a-z]*\n[\s\S]*?\n\`\`\`)/g);

    return sections.flatMap((section, index) => {
      // Handle Code Blocks
      if (section.startsWith('\`\`\`')) {
        const match = section.match(/\`\`\`([a-z]*)\n([\s\S]*?)\n\`\`\`/);
        if (match) {
          const language = match[1] || 'text';
          const code = match[2];
          return [<CodeBlock key={`code-${index}`} code={code} language={language} />];
        }
      }

      // Handle Headings and Paragraphs
      return section
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line, lineIndex) => {
          if (line.startsWith('# ')) {
            return (
              <h1
                key={`h1-${index}-${lineIndex}`}
                className="font-ops mt-12 mb-6 text-4xl font-bold tracking-tight md:text-5xl"
              >
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2
                key={`h2-${index}-${lineIndex}`}
                className="font-display mt-10 mb-4 text-2xl font-bold md:text-3xl"
              >
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3
                key={`h3-${index}-${lineIndex}`}
                className="mt-8 mb-3 text-xl font-bold md:text-2xl"
              >
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li
                key={`li-${index}-${lineIndex}`}
                className="text-muted-foreground my-2 ml-6 list-disc"
              >
                {line.replace('- ', '')}
              </li>
            );
          }

          return (
            <p
              key={`p-${index}-${lineIndex}`}
              className="text-muted-foreground mb-4 text-lg leading-relaxed"
            >
              {line}
            </p>
          );
        });
    });
  };

  return (
    <article className="bg-background relative flex min-h-screen flex-col items-center px-6 pt-32 pb-20">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[50%] h-[50%] w-[50%] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[150px]" />
      </div>

      <div className="w-full max-w-4xl">
        {/* Navigation */}
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

        {/* Hero Section */}
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

        {/* Content Area */}
        <div className="prose prose-invert max-w-none">
          <BlogContent>{renderContent(blog.content)}</BlogContent>
        </div>

        {/* Footer / Tags */}
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
