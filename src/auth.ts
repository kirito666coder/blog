import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {
      console.warn('SIGNIN CALLBACK TRIGGERED');
      console.warn(user);

      if (user) return true;
      return false;
    },
  },
});
