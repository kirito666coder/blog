import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blogs | Kirito Blog',
  description:
    'Deep dives into modern web technologies, architectural patterns, and the ever-evolving landscape of software engineering.',
  keywords: ['tech blog', 'react', 'nextjs', 'devops', 'frontend', 'backend'],
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
