'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBlogStatus, deleteBlog } from '../../actions';
import { toast } from 'react-toastify';

interface Props {
  blogId: string;
  currentStatus: string;
}

export default function AdminBlogActions({ blogId, currentStatus }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const result = await updateBlogStatus(blogId, newStatus);

    if (result.success) {
      toast.success(`Blog status updated to ${newStatus}`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update status');
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this blog? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteBlog(blogId);

    if (result.success) {
      toast.success('Blog deleted successfully');
      router.push('/admin/blogs');
    } else {
      toast.error(result.error || 'Failed to delete blog');
      setIsDeleting(false);
    }
  };

  return (
    <div className="border-border/50 mt-6 flex flex-wrap gap-3 border-t pt-6">
      <button
        onClick={handleStatusToggle}
        disabled={isUpdating || isDeleting}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          currentStatus === 'published'
            ? 'border border-orange-500/20 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
            : 'border border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20'
        } disabled:opacity-50`}
      >
        {isUpdating
          ? 'Updating...'
          : currentStatus === 'published'
            ? 'Revert to Draft'
            : 'Publish Blog'}
      </button>

      <button
        onClick={handleDelete}
        disabled={isUpdating || isDeleting}
        className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Delete Blog'}
      </button>
    </div>
  );
}
