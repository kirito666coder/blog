import { z } from 'zod';

export const blogValidator = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(10),

  tags: z.array(z.string()),

  category: z.string().min(1),

  status: z.enum(['draft', 'published']),

  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()),
  }),
});
