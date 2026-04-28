import { blogSchema } from '@/models/blog.schema';
import type { Document, WithId } from 'mongodb';

export function toBlogDTO(doc: WithId<Document>) {
  const raw = {
    _id: doc._id.toString(),

    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt ?? '',
    content: doc.content,

    tags: doc.tags ?? [],
    category: doc.category,
    status: doc.status,

    coverImage: doc.coverImage,

    author: doc.author,
    stats: doc.stats,
    readingTime: doc.readingTime,
    seo: doc.seo,

    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    publishedAt: doc.publishedAt?.toISOString() ?? null,
  };

  return blogSchema.parse(raw);
}
