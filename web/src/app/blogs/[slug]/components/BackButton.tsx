'use client';

import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="group text-muted-foreground hover:text-foreground mb-12 flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:-translate-x-1"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      GO BACK
    </button>
  );
}
