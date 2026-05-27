import { getCollection } from '@/db/services/collectionServices';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboardPage() {
  const usersCollection = await getCollection('users');
  const blogsCollection = await getCollection('blogs');

  const usersCount = await usersCollection.countDocuments();
  const totalBlogs = await blogsCollection.countDocuments();
  const publishedBlogs = await blogsCollection.countDocuments({
    status: 'published',
  });
  const drafts = await blogsCollection.countDocuments({ status: 'draft' });

  return (
    <div className="p-8 md:p-12">
      <header className="mb-12">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Welcome to the admin panel. Here is a summary of your platform.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={usersCount.toString()}
          href="/admin/users"
          color="bg-blue-500/10 text-blue-500 border-blue-500/20"
        />
        <StatCard
          title="Total Blogs"
          value={totalBlogs.toString()}
          href="/admin/blogs"
          color="bg-purple-500/10 text-purple-500 border-purple-500/20"
        />
        <StatCard
          title="Published"
          value={publishedBlogs.toString()}
          href="/admin/blogs?status=published"
          color="bg-green-500/10 text-green-500 border-green-500/20"
        />
        <StatCard
          title="Drafts"
          value={drafts.toString()}
          href="/admin/blogs?status=draft"
          color="bg-orange-500/10 text-orange-500 border-orange-500/20"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
  color,
}: {
  title: string;
  value: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-4 rounded-2xl border p-6 backdrop-blur-md transition-all hover:scale-[1.02] ${color}`}
    >
      <h3 className="text-sm font-semibold tracking-wider uppercase opacity-80">
        {title}
      </h3>
      <div className="font-display text-5xl font-bold">{value}</div>
    </Link>
  );
}
