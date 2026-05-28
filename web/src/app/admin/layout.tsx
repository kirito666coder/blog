import Link from 'next/link';
import { ComponentType, ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex max-h-screen min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="border-border/50 bg-background/50 flex flex-col gap-8 border-r p-6 backdrop-blur-xl md:sticky md:top-0 md:h-screen md:w-64">
        <div className="flex items-center gap-3">
          <span className="font-ops ml-3 text-xl tracking-wide">
            Admin Panel
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          <NavLink href="/admin" icon={DashboardIcon}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/users" icon={UsersIcon}>
            Manage Users
          </NavLink>
          <NavLink href="/admin/blogs" icon={BlogsIcon}>
            Manage Blogs
          </NavLink>
          <NavLink href="/admin/blogs/create" icon={CreateIcon}>
            Create Post
          </NavLink>
        </nav>

        <div className="border-border/50 mt-auto border-t pt-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 flex items-center gap-3 rounded-lg px-4 py-2 transition-colors"
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
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: ComponentType<IconProps>;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground group hover:bg-foreground/5 flex items-center gap-3 rounded-lg px-4 py-3 transition-all"
    >
      <Icon className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
      <span className="font-medium">{children}</span>
    </Link>
  );
}

const DashboardIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const UsersIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BlogsIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const CreateIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);
