'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';

interface TransitionLinkProps {
  href: string;
  revealName: string;
  children: React.ReactNode;
  className?: string;
  x?: number;
}

export function TransitionLink({
  href,
  revealName,
  children,
  className,
  x = 3000,
}: TransitionLinkProps) {
  const router = useRouter();

  const startReveal = useAppStore((s) => s.startReveal);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    startReveal(revealName, x);

    router.push(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
