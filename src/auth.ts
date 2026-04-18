import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { connectDb } from './lib/mongodb';
import { userSchema } from './models/user.schema';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.email) return false;

        const db = await connectDb();
        const email = user.email.toLocaleLowerCase();

        const existingUser = await db.collection('users').findOne({ email });

        if (!existingUser) {
          const result = userSchema.safeParse({
            name: user.name,
            email,
            image: user.image,
            role: 'user',
            createdAt: new Date(),
          });

          if (!result.success) {
            console.error('zod validation failed:', result.error);
            return false;
          }
          await db.collection('users').insertOne(result.data);
        }
        return true;
      } catch (error) {
        console.error('Error in signIn:', error);
        return false;
      }
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      const db = await connectDb();

      const dbUser = await db
        .collection('users')
        .findOne({ email: session.user.email.toLowerCase() });

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role;
      }
      return session;
    },
  },
});
