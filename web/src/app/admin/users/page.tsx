import { getCollection } from '@/db/services/collectionServices';
import Link from 'next/link';

export const metadata = {
  title: 'Manage Users | Admin',
};

export default async function AdminUsersPage() {
  const usersCollection = await getCollection('users');
  const users = await usersCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="mx-auto max-w-7xl p-8 md:p-12">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Manage Users
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            View and manage registered users and their blogs.
          </p>
        </div>
      </header>

      <div className="border-border/50 bg-background/50 overflow-hidden rounded-xl border backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border/50 bg-muted/20 border-b">
                <th className="text-muted-foreground p-4 font-medium">User</th>
                <th className="text-muted-foreground p-4 font-medium">Role</th>
                <th className="text-muted-foreground p-4 font-medium">
                  Joined
                </th>
                <th className="text-muted-foreground p-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id.toString()}
                  className="border-border/10 hover:bg-muted/10 border-b transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-bold">
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
                        <div className="font-semibold">
                          {user.name || 'Unnamed User'}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        user.role === 'admin'
                          ? 'border border-blue-500/20 bg-blue-500/10 text-blue-500'
                          : 'border border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                      }`}
                    >
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="text-muted-foreground p-4">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/users/${user._id.toString()}`}
                      className="focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      View Blogs
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-muted-foreground p-8 text-center"
                  >
                    No users found.
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
