import { getCollection } from '@/db/services/collectionServices';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import AdminBlogActions from './AdminBlogActions';

export const metadata = {
  title: 'Review Blog | Admin',
};

export default async function AdminBlogReviewPage({
  params,
}: {
  params: { id: string };
}) {
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(params.id);
  } catch (error) {
    return notFound();
  }

  const blogsCollection = await getCollection('blogs');
  const blog = await blogsCollection.findOne({ _id: objectId });

  if (!blog) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl p-8 md:p-12">
      <div className="mb-6">
        <Link
          href="/admin/blogs"
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 transition-colors"
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
          Back to Blogs
        </Link>
      </div>

      <div className="bg-background/80 border-border/50 rounded-2xl border p-6 shadow-xl backdrop-blur-xl md:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide capitalize ${
              blog.status === 'published'
                ? 'border border-green-500/20 bg-green-500/10 text-green-500'
                : 'border border-orange-500/20 bg-orange-500/10 text-orange-500'
            }`}
          >
            {blog.status}
          </span>
          <span className="text-muted-foreground border-border/50 border-l pl-3 text-sm">
            {blog.category || 'Uncategorized'}
          </span>
        </div>

        <h1 className="font-display mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-muted-foreground mb-8 border-l-4 border-blue-500 pl-4 text-xl">
            {blog.excerpt}
          </p>
        )}

        <div className="border-border/50 mb-10 flex items-center gap-4 border-b pb-10">
          <div className="bg-muted border-background flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 font-bold shadow-sm">
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
          <div>
            <div className="text-lg font-medium">
              {blog.author?.name || 'Unknown Author'}
            </div>
            <div className="text-muted-foreground flex gap-2 text-sm">
              <span>
                {blog.createdAt
                  ? new Date(blog.createdAt).toLocaleDateString()
                  : 'Unknown Date'}
              </span>
              <span>•</span>
              <span>{blog.readingTime || 5} min read</span>
            </div>
          </div>
        </div>

        {blog.coverImage?.url && (
          <div className="border-border/20 mb-10 overflow-hidden rounded-xl border shadow-lg">
            <img
              src={blog.coverImage.url}
              alt={blog.coverImage.alt || 'Cover image'}
              className="max-h-[400px] w-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-invert prose-lg prose-headings:font-display prose-a:text-blue-400 max-w-none">
          <ReactMarkdown>{blog.content || '*No content*'}</ReactMarkdown>
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {blog.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-muted/50 text-muted-foreground border-border/50 rounded-full border px-3 py-1 text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <AdminBlogActions
          blogId={blog._id.toString()}
          currentStatus={blog.status || 'draft'}
        />
      </div>
    </div>
  );
}
