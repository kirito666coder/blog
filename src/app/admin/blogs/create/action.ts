'use server';

import { auth } from '@/auth';
import { connectDb } from '@/lib/mongodb';
import { blogValidator } from '@/lib/validators/blogs';
export async function createBlog(data: unknown) {
  try {
    const parsed = blogValidator.safeParse(data);

    if (!parsed.success) {
      return {
        error: parsed.error.flatten(),
      };
    }

    const session = await auth();

    if (!session?.user) {
      return {
        error: {
          message: 'Unauthorized',
        },
      };
    }

    const user = session.user;

    const db = await connectDb();

    const validData = parsed.data;

    const finalData = {
      ...validData,
      author: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.image,
        role: user.role,
      },
      stats: {
        views: 0,
        likes: 0,
      },
      readingTime: Math.ceil(validData.content.split(/\s+/).length / 200),
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: validData.status === 'published' ? new Date() : null,
    };

    await db.collection('blogs').insertOne(finalData);

    return { success: true };
  } catch (error) {
    console.error('Create Blog Error: ', error);

    return {
      error: {
        message: 'Failed to create blog',
      },
    };
  }
}
