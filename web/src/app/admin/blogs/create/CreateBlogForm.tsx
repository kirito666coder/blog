'use client';

import React, { useState } from 'react';
import CutCornerButton from '@/components/CutCornerButton';
import { blogValidator } from '@/lib/validators/blogs';
import { createBlog, findSlug } from './action';
import { toast } from 'react-toastify';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  category: string;
  status: 'draft' | 'published';
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export default function CreateBlogForm() {
  const [showPrompt, setShowPrompt] = useState(false);

  const prompt = `Write a high-quality blog post in Markdown format.

Requirements:
- Use clear headings (##, ###)
- Add proper paragraphs
- Include code examples using triple backticks with language (e.g. \`\`\`tsx)
- Keep it structured and readable
- Add a short conclusion at the end

Topic: [Replace with your topic]
`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
  };

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: '',
    category: '',
    status: 'draft',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        seo: { ...prev.seo, [seoField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generateSlug = async () => {
    if (!formData.title) return;
    const generated = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const SlugIsAvailable = await findSlug(generated);

    if (!SlugIsAvailable.available) {
      if (!SlugIsAvailable.suggestedSlug)
        return toast.error('Something went wrong');
      setFormData((prev) => ({
        ...prev,
        slug: SlugIsAvailable.suggestedSlug,
      }));
      toast.info(`Slug updated to ${SlugIsAvailable.suggestedSlug}`);
      return;
    }

    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const SlugIsAvailable = await findSlug(formData.slug);

    if (!SlugIsAvailable.available) {
      if (!SlugIsAvailable.suggestedSlug) return;
      setFormData((prev) => ({
        ...prev,
        slug: SlugIsAvailable.suggestedSlug,
      }));
      toast.info(`Slug updated to ${SlugIsAvailable.suggestedSlug}`);
    }
    // Process comma-separated tags
    const processedData = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      seo: {
        ...formData.seo,
        keywords: formData.seo.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      },
    };

    const result = blogValidator.safeParse(processedData);

    if (!result.success) {
      console.error('zod validation failed:', result.error.flatten());
      toast.error(result.error.message);
      setIsSubmitting(false);
      return;
    }

    const res = await createBlog(result.data);

    if (res.error) {
      console.error(res.error);
      setIsSubmitting(false);
      return;
    }

    toast.success('Blog created successfully');
    setIsSubmitting(false);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      tags: '',
      category: '',
      status: 'draft',
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info Section */}
      <section className="bg-card border-border rounded-2xl border">
        <div className="border-border border-b px-6 py-5">
          <h2 className="text-xl font-semibold">General Details</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Basic information about the blog post.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          {/* Title */}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>

            <input
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="The Future of React"
              className="bg-background border-border focus:border-foreground h-11 w-full rounded-lg border px-4 outline-none"
            />
          </div>

          {/* Slug */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug
              </label>

              <button
                type="button"
                onClick={generateSlug}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Generate
              </button>
            </div>

            <input
              id="slug"
              name="slug"
              required
              value={formData.slug}
              onChange={handleChange}
              className="bg-background border-border focus:border-foreground h-11 w-full rounded-lg border px-4 font-mono outline-none"
            />
          </div>

          {/* Category */}

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>

            <input
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="bg-background border-border focus:border-foreground h-11 w-full rounded-lg border px-4 outline-none"
            />
          </div>

          {/* Status */}

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="bg-background border-border focus:border-foreground h-11 w-full rounded-lg border px-4 outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-card border-border rounded-2xl border">
        <div className="border-border border-b px-6 py-5">
          <h2 className="text-xl font-semibold">Content</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Write your article content using Markdown.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <label htmlFor="excerpt" className="text-sm font-medium">
              Excerpt
            </label>

            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={handleChange}
              className="bg-background border-border focus:border-foreground w-full rounded-lg border p-4 outline-none"
            />
          </div>

          <div className="bg-muted/30 border-border rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-semibold">Markdown Tips</h3>

            <pre className="text-muted-foreground overflow-x-auto text-xs">
              {`## Heading

\`\`\`tsx
function App() {
  return <div>Hello</div>;
}
\`\`\`
`}
            </pre>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>

            <textarea
              id="content"
              name="content"
              rows={18}
              value={formData.content}
              onChange={handleChange}
              className="bg-background border-border focus:border-foreground w-full rounded-lg border p-4 font-mono text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>

            <input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react,nextjs,mongodb"
              className="bg-background border-border focus:border-foreground h-11 w-full rounded-lg border px-4 outline-none"
            />
          </div>
        </div>
      </section>
      {/* SEO Section */}
      <section className="bg-card border-border rounded-2xl border">
        <div className="border-border border-b px-6 py-5">
          <h2 className="text-xl font-semibold">SEO</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Search engine optimization settings.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Title</label>

            <input
              name="seo.metaTitle"
              value={formData.seo.metaTitle}
              onChange={handleChange}
              maxLength={60}
              className="bg-background border-border focus:border-foreground h-11 w-full rounded-lg border px-4 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords</label>

            <input
              name="seo.keywords"
              value={formData.seo.keywords}
              onChange={handleChange}
              className="bg-background border-border focus:border-foreground h-11 w-full rounded-lg border px-4 outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Meta Description</label>

            <textarea
              name="seo.metaDescription"
              value={formData.seo.metaDescription}
              onChange={handleChange}
              rows={4}
              maxLength={160}
              className="bg-background border-border focus:border-foreground w-full rounded-lg border p-4 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Submit Actions */}
      <div className="flex justify-end pt-4 pb-20">
        <CutCornerButton
          text={isSubmitting ? 'publishing...' : 'Publish'}
          type="submit"
          disabled={isSubmitting}
          className={`${isSubmitting ? 'border-green-600' : 'border-blue-600'}`}
        />
      </div>
    </form>
  );
}
