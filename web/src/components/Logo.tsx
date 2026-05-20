import Link from 'next/link';
export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-ops tracking-tighter transition-opacity ${className}`}
    >
      KIRITO
      <div className="leading-7">BLOG</div>
    </Link>
  );
}
