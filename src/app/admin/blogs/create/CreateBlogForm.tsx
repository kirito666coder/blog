'use client';

import React, { useState } from 'react';
import CutCornerButton from '@/components/CutCornerButton';
import { blogValidator } from '@/lib/validators/blogs';
import { createBlog } from './action';

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
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

  const generateSlug = () => {
    if (!formData.title) return;
    const generated = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      setIsSubmitting(false);
      return;
    }

    const res = await createBlog(result.data);

    if (res.error) {
      console.error(res.error);
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Blog created successfully! (Check console for payload)');
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Basic Info Section */}
      <section className="glass premium-shadow relative flex flex-col gap-6 overflow-hidden rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />

        <h2 className="font-display flex items-center gap-3 text-2xl font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-sm text-blue-500">
            1
          </span>
          General Details
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="title"
              className="text-muted-foreground text-sm font-medium tracking-wider uppercase"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              placeholder="The Future of React..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="slug"
              className="text-muted-foreground flex items-center justify-between text-sm font-medium tracking-wider uppercase"
            >
              <span>Slug</span>
              <button
                type="button"
                onClick={generateSlug}
                className="text-xs text-blue-500 transition-colors hover:text-blue-400"
              >
                Auto-generate
              </button>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              value={formData.slug}
              onChange={handleChange}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 rounded-lg border px-4 py-3 font-mono text-sm transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              placeholder="the-future-of-react"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="category"
              className="text-muted-foreground text-sm font-medium tracking-wider uppercase"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              placeholder="Engineering"
            />
          </div>

          <div className="flex gap-6">
            <div className="flex flex-1 flex-col gap-2">
              <label
                htmlFor="status"
                className="text-muted-foreground text-sm font-medium tracking-wider uppercase"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="bg-input/20 border-border/50 text-foreground cursor-pointer appearance-none rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              >
                <option value="draft" className="bg-background">
                  Draft
                </option>
                <option value="published" className="bg-background">
                  Published
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="glass premium-shadow relative flex flex-col gap-6 overflow-hidden rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

        <h2 className="font-display flex items-center gap-3 text-2xl font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-500">
            2
          </span>
          Content
        </h2>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="excerpt"
              className="text-muted-foreground text-sm font-medium tracking-wider uppercase"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={2}
              value={formData.excerpt}
              onChange={handleChange}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              placeholder="A short, catchy summary of the post..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="content"
              className="text-muted-foreground flex items-center justify-between text-sm font-medium tracking-wider uppercase"
            >
              <span>Main Content (Markdown)</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={12}
              value={formData.content}
              onChange={handleChange}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-y rounded-lg border px-4 py-3 font-mono text-sm transition-all focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              placeholder="## Write your amazing content here..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="tags"
              className="text-muted-foreground text-sm font-medium tracking-wider uppercase"
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              placeholder="react, frontend, architecture"
            />
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="glass premium-shadow relative flex flex-col gap-6 overflow-hidden rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />

        <h2 className="font-display flex items-center gap-3 text-2xl font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-sm text-purple-500">
            3
          </span>
          SEO Optimization
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="metaTitle"
              className="text-muted-foreground text-sm font-medium tracking-wider uppercase"
            >
              Meta Title
            </label>
            <input
              type="text"
              id="metaTitle"
              name="seo.metaTitle"
              required
              value={formData.seo.metaTitle}
              onChange={handleChange}
              maxLength={60}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
              placeholder="The Future of React..."
            />
            <span className="text-muted-foreground/60 text-right text-xs">
              {formData.seo.metaTitle.length}/60
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="keywords"
              className="text-muted-foreground text-sm font-medium tracking-wider uppercase"
            >
              Meta Keywords
            </label>
            <input
              type="text"
              id="keywords"
              name="seo.keywords"
              value={formData.seo.keywords}
              onChange={handleChange}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
              placeholder="react, frontend, js"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label
              htmlFor="metaDescription"
              className="text-muted-foreground text-sm font-medium tracking-wider uppercase"
            >
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              name="seo.metaDescription"
              required
              rows={2}
              maxLength={160}
              value={formData.seo.metaDescription}
              onChange={handleChange}
              className="bg-input/20 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
              placeholder="Discover how React's new compiler changes the game..."
            />
            <span className="text-muted-foreground/60 text-right text-xs">
              {formData.seo.metaDescription.length}/160
            </span>
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
