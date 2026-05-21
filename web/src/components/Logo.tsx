import Link from 'next/link';
import { TextIntro } from './Animations';
export default function Logo({ className }: { className?: string }) {
  return (
    <TextIntro>
      <Link
        href="/"
        className={`font-ops tracking-tighter transition-opacity ${className}`}
      >
        KIRITO
        <div className="leading-7">BLOG</div>
      </Link>
    </TextIntro>
  );
}
