export type Blog = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;

  tags: string[];
  category: string;

  status: 'draft' | 'published';

  coverImage?: {
    url: string;
    alt: string;
  };

  author: {
    id: string;
    email: string;
    name: string;
    avatar: string;
    role: string;
  };

  stats: {
    views: number;
    likes: number;
  };

  readingTime: number;

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
