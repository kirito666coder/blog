import { getCollection } from '@/db/services/collectionServices';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'User Details | Admin',
};

export default async function AdminUserPage({
  params,
}: {
  params: { id: string };
}) {
  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(params.id);
  } catch (error) {
    return notFound();
  }

  const usersCollection = await getCollection('users');
  const user = await usersCollection.findOne({ _id: userObjectId });

  if (!user) {
    return notFound();
  }

  const blogsCollection = await getCollection('blogs');
  // Check both author.id as a string and any reference formats just in case
  const blogs = await blogsCollection
    .find({
      $or: [
        { 'author.id': params.id },
        { 'author.id': userObjectId },
        { authorId: params.id },
        { authorId: userObjectId },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="mx-auto max-w-7xl p-8 md:p-12">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Users
        </Link>
      </div>

      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex items-center gap-6">
          <div className="bg-muted border-background flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 text-3xl font-bold shadow-lg">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              user.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              {user.name || 'Unnamed User'}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">{user.email}</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                  user.role === 'admin'
                    ? 'border border-blue-500/20 bg-blue-500/10 text-blue-500'
                    : 'border border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                }`}
              >
                {user.role || 'user'}
              </span>
              <span className="text-muted-foreground border-border/50 border-l pl-3 text-sm">
                Joined:{' '}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-12">
        <h2 className="font-display mb-6 text-2xl font-bold">
          User&apos;s Blogs ({blogs.length})
        </h2>

        <div className="border-border/50 bg-background/50 overflow-hidden rounded-xl border backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-border/50 bg-muted/20 border-b">
                  <th className="text-muted-foreground p-4 font-medium">
                    Title
                  </th>
                  <th className="text-muted-foreground p-4 font-medium">
                    Status
                  </th>
                  <th className="text-muted-foreground p-4 font-medium">
                    Date
                  </th>
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
                    <td className="p-4">
                      <div className="max-w-[300px] truncate font-medium">
                        {blog.title}
                      </div>
                      <div className="text-muted-foreground truncate text-sm">
                        {blog.slug}
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
                    <td className="text-muted-foreground p-4">
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString()
                        : 'Unknown'}
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
                      colSpan={4}
                      className="text-muted-foreground p-8 text-center"
                    >
                      This user has not created any blogs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
