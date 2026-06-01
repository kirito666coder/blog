'use server';

import { getCollection } from '@/db/services/collectionServices';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateBlogStatus(
  id: string,
  newStatus: 'published' | 'draft'
) {
  try {
    const objectId = new ObjectId(id);
    const blogsCollection = await getCollection('blogs');

    await blogsCollection.updateOne(
      { _id: objectId },
      { $set: { status: newStatus, updatedAt: new Date().toISOString() } }
    );

    revalidatePath('/admin/blogs');
    revalidatePath(`/admin/blogs/${id}`);
    revalidatePath(`/admin/users`);

    return { success: true };
  } catch (error) {
    console.error('Error updating blog status:', error);
    return { success: false, error: 'Failed to update blog status.' };
  }
}

export async function deleteBlog(id: string) {
  try {
    const objectId = new ObjectId(id);
    const blogsCollection = await getCollection('blogs');

    await blogsCollection.deleteOne({ _id: objectId });

    revalidatePath('/admin/blogs');
    revalidatePath(`/admin/users`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting blog:', error);
    return { success: false, error: 'Failed to delete blog.' };
  }
}
