import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),

  tags: z.array(z.string()),
  category: z.string(),

  status: z.enum(['draft', 'published']),

  coverImage: z
    .object({
      url: z.string(),
      alt: z.string(),
    })
    .optional(),

  author: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatar: z.string(),
    role: z.string(),
  }),

  stats: z.object({
    views: z.number(),
    likes: z.number(),
  }),

  readingTime: z.number(),

  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()),
  }),

  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable(),
});

export type Blog = z.infer<typeof blogSchema>;
