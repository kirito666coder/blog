'use client';

import { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';

type signInProps = {
  session: Session | null;
  status: string;
};

export default function SignIn({ session, status }: signInProps) {
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {session ? (
        <>
          <button
            onClick={() => signOut()}
            className="cursor-pointer hover:text-red-500"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn('github')}
          className="cursor-pointer hover:text-green-500"
        >
          Sign In
        </button>
      )}
    </div>
  );
}
