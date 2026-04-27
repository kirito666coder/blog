'use server';
import { getCollection } from '@/db/services/collectionServices';
import type { Blog } from '@/models/blog.schema';

export async function getBlogs() {
  try {
    const db = await getCollection('blogs');
    const blogs = await db.find({}).toArray();
    return { data: blogs as unknown as Blog[], success: true };
  } catch {
    return {
      error: {
        message: 'Failed to get blogs',
      },
    };
  }
}
