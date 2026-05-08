'use server';

import { auth } from '@/auth';
import { getCollection } from '@/db/services/collectionServices';
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: validData.status === 'published' ? new Date().toISOString() : null,
    };

    const db = await getCollection('blogs');

    await db.insertOne(finalData);

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

export async function findSlug(slug: string) {
  try {
    const db = await getCollection('blogs');

    const existing = await db.findOne({ slug });

    if (!existing) {
      return {
        available: true,
        suggestedSlug: slug,
      };
    }

    let count = 1;
    let newSlug = `${slug}-${count}`;

    while (await db.findOne({ slug: newSlug })) {
      count++;
      newSlug = `${slug}-${count}`;
    }

    return {
      available: false,
      suggestedSlug: newSlug,
    };
  } catch {
    return {
      error: {
        message: 'Something went wrong',
      },
    };
  }
}
