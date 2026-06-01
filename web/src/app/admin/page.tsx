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

  const drafts = await blogsCollection.countDocuments({
    status: 'draft',
  });

  return (
    <div className="space-y-10 p-8">
      {/* Header */}

      <div>
        <h1 className="text-foreground text-4xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="text-muted-foreground mt-2">
          Monitor content, users and platform activity.
        </p>
      </div>

      {/* Stats */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Users"
          value={usersCount}
          href="/admin/users"
          icon={<UsersIcon />}
        />

        <StatCard
          title="Articles"
          value={totalBlogs}
          href="/admin/blogs"
          icon={<ArticleIcon />}
        />

        <StatCard
          title="Published"
          value={publishedBlogs}
          href="/admin/blogs?status=published"
          icon={<PublishedIcon />}
        />

        <StatCard
          title="Drafts"
          value={drafts}
          href="/admin/blogs?status=draft"
          icon={<DraftIcon />}
        />
      </section>

      {/* Quick Actions */}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard
            href="/admin/blogs/create"
            title="Create Article"
            description="Write and publish new content."
          />

          <ActionCard
            href="/admin/blogs"
            title="Manage Content"
            description="Edit existing articles."
          />

          <ActionCard
            href="/admin/users"
            title="Manage Users"
            description="View and manage members."
          />
        </div>
      </section>

      {/* Platform Overview */}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Platform Overview</h2>

        <div className="border-border bg-card rounded-2xl border">
          <div className="divide-border grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
            <OverviewItem
              label="Published Ratio"
              value={`${Math.round(
                (publishedBlogs / Math.max(totalBlogs, 1)) * 100
              )}%`}
            />

            <OverviewItem
              label="Draft Ratio"
              value={`${Math.round((drafts / Math.max(totalBlogs, 1)) * 100)}%`}
            />

            <OverviewItem
              label="Users per Post"
              value={totalBlogs ? (usersCount / totalBlogs).toFixed(1) : '0'}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
  icon,
}: {
  title: string;
  value: number;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="border-border bg-card hover:border-foreground/20 group rounded-2xl border p-6 transition-all"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{title}</span>

        <div className="text-muted-foreground">{icon}</div>
      </div>

      <div className="text-foreground text-4xl font-bold">{value}</div>
    </Link>
  );
}

function ActionCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="border-border bg-card hover:border-foreground/20 rounded-2xl border p-5 transition-all"
    >
      <h3 className="font-medium">{title}</h3>

      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </Link>
  );
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6">
      <p className="text-muted-foreground text-sm">{label}</p>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

function PublishedIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
