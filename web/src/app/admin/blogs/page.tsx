import { getCollection } from '@/db/services/collectionServices';
import Link from 'next/link';

export const metadata = {
  title: 'Manage Blogs | Admin',
};

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const filter = searchParams.status ? { status: searchParams.status } : {};
  const blogsCollection = await getCollection('blogs');
  const blogs = await blogsCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="mx-auto max-w-7xl p-8 md:p-12">
      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Manage Blogs
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Review, publish, draft, or delete blogs from all users.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/blogs"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!searchParams.status ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
          >
            All
          </Link>
          <Link
            href="/admin/blogs?status=published"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${searchParams.status === 'published' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
          >
            Published
          </Link>
          <Link
            href="/admin/blogs?status=draft"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${searchParams.status === 'draft' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
          >
            Drafts
          </Link>
        </div>
      </header>

      <div className="border-border/50 bg-background/50 overflow-hidden rounded-xl border backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border/50 bg-muted/20 border-b">
                <th className="text-muted-foreground p-4 font-medium">
                  Blog Details
                </th>
                <th className="text-muted-foreground p-4 font-medium">
                  Author
                </th>
                <th className="text-muted-foreground p-4 font-medium">
                  Status
                </th>
                <th className="text-muted-foreground p-4 font-medium">Stats</th>
                <th className="text-muted-foreground p-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr
                  key={blog._id.toString()}
                  className="border-border/10 hover:bg-muted/10 border-b transition-colors"
                >
                  <td className="max-w-[250px] p-4">
                    <div className="truncate font-semibold">{blog.title}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {blog.slug}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-xs">
                        {blog.author?.avatar ? (
                          <img
                            src={blog.author.avatar}
                            alt={blog.author.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          blog.author?.name?.charAt(0).toUpperCase() || 'A'
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {blog.author?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        blog.status === 'published'
                          ? 'border border-green-500/20 bg-green-500/10 text-green-500'
                          : 'border border-orange-500/20 bg-orange-500/10 text-orange-500'
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground p-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span>{blog.stats?.views || 0} views</span>
                      <span>{blog.stats?.likes || 0} likes</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/blogs/${blog._id.toString()}`}
                      className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground p-8 text-center"
                  >
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
