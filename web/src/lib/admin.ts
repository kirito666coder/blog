import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCollection } from '@/db/services/collectionServices';

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/');
  }

  const usersCollection = await getCollection('users');

  const user = await usersCollection.findOne({
    email: session.user.email,
  });

  if (user?.role !== 'admin') {
    redirect('/');
  }

  return user;
}
