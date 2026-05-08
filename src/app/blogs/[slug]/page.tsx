import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dummyBlogs } from '@/data/blogs';

import BlogDetailClient from './BlogDetailClient';
import { getBlogBySlug } from './action';

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
    return { title: 'Blog Not Found' };
  }

  return {
    title: `${blog.seo.metaTitle} | Kirito Blog`,
    description: blog.seo.metaDescription,
    keywords: blog.seo.keywords,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  console.log(blog);

  if (!blog.data) {
    notFound();
  }

  return <BlogDetailClient blog={blog.data} />;
}
