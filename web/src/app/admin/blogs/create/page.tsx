import type { Metadata } from 'next';
import CreateBlogForm from './CreateBlogForm';

export const metadata: Metadata = {
  title: 'Create Blog Post | Admin',
  description: 'Create a new technical blog post.',
};

export default function CreateBlogPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="text-muted-foreground mb-2 text-sm">Admin / Blogs</p>

          <h1 className="text-4xl font-bold tracking-tight">
            Create Blog Post
          </h1>

          <p className="text-muted-foreground mt-2">
            Write, optimize and publish content.
          </p>
        </div>

        <CreateBlogForm />
      </div>
    </div>
  );
}
