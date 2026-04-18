import Link from 'next/link';
import CutCornerButton from '../CutCornerButton';
import { auth } from '@/auth';
import SignIn from '../sign-in';
import SignOut from '../sign-out';

export async function Navbar() {
  const session = await auth();
  return (
    <header className="sticky top-5 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-10 px-6">
        <div className="flex items-center justify-center gap-10">
          <Link
            href="/"
            className="font-ops text-xl tracking-tighter transition-opacity hover:opacity-80"
          >
            KIRITO.BLOG
          </Link>

          <nav className="flex items-center gap-8">
            <CutCornerButton text="Blogs </>" url="/blogs" />
            <CutCornerButton text="About </>" url="/about" />
          </nav>
        </div>
        {session ? <SignOut /> : <SignIn />}
      </div>
    </header>
  );
}
