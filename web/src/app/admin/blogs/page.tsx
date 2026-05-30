import { getCollection } from '@/db/services/collectionServices';
import Link from 'next/link';

export const metadata = {
  title: 'Manage Blogs | Admin',
};

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const status = params.status;

  const filter =
    status && ['published', 'draft'].includes(status) ? { status } : {};

  const blogsCollection = await getCollection('blogs');

  const blogs = await blogsCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Content Management
          </h1>

          <p className="text-muted-foreground mt-2">
            Review, publish, update and manage articles across the platform.
          </p>
        </div>

        <Link
          href="/admin/blogs/create"
          className="bg-foreground text-background inline-flex items-center rounded-xl px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Create Article
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/admin/blogs"
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            !status
              ? 'bg-foreground text-background'
              : 'bg-card border-border border'
          }`}
        >
          All Articles
        </Link>

        <Link
          href="/admin/blogs?status=published"
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            status === 'published'
              ? 'bg-green-500 text-white'
              : 'bg-card border-border border'
          }`}
        >
          Published
        </Link>

        <Link
          href="/admin/blogs?status=draft"
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            status === 'draft'
              ? 'bg-orange-500 text-white'
              : 'bg-card border-border border'
          }`}
        >
          Drafts
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="bg-card border-border rounded-2xl border p-5">
          <p className="text-muted-foreground text-sm">Total Articles</p>
          <p className="mt-2 text-3xl font-bold">{blogs.length}</p>
        </div>

        <div className="bg-card border-border rounded-2xl border p-5">
          <p className="text-muted-foreground text-sm">Current Filter</p>
          <p className="mt-2 text-3xl font-bold capitalize">
            {status || 'all'}
          </p>
        </div>

        <div className="bg-card border-border rounded-2xl border p-5">
          <p className="text-muted-foreground text-sm">Latest Update</p>
          <p className="mt-2 text-lg font-medium">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Blog Cards */}
      {blogs.length > 0 ? (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <article
              key={blog._id.toString()}
              className="bg-card border-border hover:border-foreground/20 rounded-2xl border p-6 transition-all"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Left */}
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                        blog.status === 'published'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}
                    >
                      {blog.status}
                    </span>

                    <span className="text-muted-foreground text-xs">
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString()
                        : 'Unknown Date'}
                    </span>
                  </div>

                  <h2 className="mb-2 text-xl font-semibold">{blog.title}</h2>

                  <p className="text-muted-foreground truncate text-sm">
                    /{blog.slug}
                  </p>
                </div>

                {/* Right */}
                <div className="flex flex-wrap items-center gap-8">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Views
                    </p>
                    <p className="text-lg font-semibold">
                      {blog.stats?.views ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Likes
                    </p>
                    <p className="text-lg font-semibold">
                      {blog.stats?.likes ?? 0}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
                      {blog.author?.avatar ? (
                        <img
                          src={blog.author.avatar}
                          alt={blog.author.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {blog.author?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {blog.author?.name || 'Unknown'}
                      </p>

                      <p className="text-muted-foreground text-xs">Author</p>
                    </div>
                  </div>

                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="border-border hover:bg-muted rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-card border-border rounded-2xl border py-20 text-center">
          <h3 className="text-xl font-semibold">No articles found</h3>

          <p className="text-muted-foreground mt-2">
            No blogs match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
