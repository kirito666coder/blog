import Link from 'next/link';
import CutCornerButton from '../CutCornerButton';
import { auth } from '@/auth';
import SignIn from '../sign-in';
import SignOut from '../sign-out';
import type { ReactNode } from 'react';

export async function Navbar({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <header className="fixed top-0 h-full w-full">
      <div className="mx-auto flex h-full px-6">
        <div className="z-10 mt-10 mr-5 flex w-[10%] flex-col items-center gap-10">
          <Link
            href="/"
            className="font-ops text-xl tracking-tighter transition-opacity hover:opacity-80"
          >
            KIRITO.BLOG
          </Link>
          <div className="flex h-full flex-col justify-between">
            <nav className="flex flex-col items-center gap-8">
              <div className="flex max-w-70 min-w-70 flex-col items-center justify-between gap-5">
                <CutCornerButton text="</> Blogs </>" url="/blogs" />
                <CutCornerButton text="</> About </>" url="/about" />
                <CutCornerButton text="Coming Soon" url="/coming-soon" />
                <CutCornerButton text="Coming Soon" url="/coming-soon" />
              </div>
            </nav>
            <div className="flex flex-col items-center justify-between gap-5">
              <div>
                {session && (
                  <CutCornerButton
                    text="<> Create </>"
                    url="/admin/blogs/create"
                    className="border-blue-600"
                  />
                )}
              </div>
              <div>{session ? <SignOut /> : <SignIn />}</div>
            </div>
          </div>
        </div>
        <div className="z-9 h-full w-[90%]">{children}</div>
      </div>
    </header>
  );
}
