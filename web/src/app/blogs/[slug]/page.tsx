import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dummyBlogs } from '@/data/blogs';

import BlogDetailClient from './BlogDetailClient';
import { getBlogBySlug } from './action';
import { getBlogs } from '../action';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const blogs = await getBlogs();

  if (!blogs.data) {
    return [];
  }
  return blogs.data.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog.data) {
    return { title: 'Blog Not Found' };
  }

  return {
    title: `${blog.data.seo.metaTitle} | Kirito Blog`,
    description: blog.data.seo.metaDescription,
    keywords: blog.data.seo.keywords,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog.data) {
    notFound();
  }

  return <BlogDetailClient blog={blog.data} />;
}
