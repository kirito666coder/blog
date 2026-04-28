'use server';
import { toBlogDTO } from '@/db/blog.dto';
import { getCollection } from '@/db/services/collectionServices';
import type { Blog } from '@/models/blog.schema';

export async function getBlogs() {
  try {
    const db = await getCollection('blogs');
    const blogsRaw = await db.find({}).toArray();
    const blogs = blogsRaw.map(toBlogDTO);
    return { data: blogs as unknown as Blog[], success: true };
  } catch {
    return {
      error: {
        message: 'Failed to get blogs',
      },
    };
  }
}
