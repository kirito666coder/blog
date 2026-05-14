import type { Metadata } from 'next';
import CreateBlogForm from './CreateBlogForm';

export const metadata: Metadata = {
  title: 'Create Blog Post | Admin',
  description: 'Create a new technical blog post.',
};

export default function CreateBlogPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-20 lg:py-32">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-blue-500/50" />
            <span className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase">
              Admin Portal
            </span>
          </div>

          <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl lg:text-6xl">
            Create{' '}
            <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-8">
              Post
            </span>
            .
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl">
            Draft and publish a new technical artifact. Ensure all fields are
            filled properly before publishing.
          </p>
        </header>

        <main>
          <CreateBlogForm />
        </main>
      </div>
    </div>
  );
}
