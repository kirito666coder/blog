import { getCollection } from '@/db/services/collectionServices';
import type { Blog } from '@/models/blog.schema';

export async function getBlogBySlug(slug: string) {
  try {
    const db = await getCollection('blogs');
    const blog = await db.findOne({ slug });

    if (!blog) {
      return { data: null, success: false };
    }

    return { data: blog as unknown as Blog, success: true };
  } catch {
    return {
      error: {
        message: 'Something went wrong',
      },
    };
  }
}
