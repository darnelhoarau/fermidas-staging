import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// import Resend from 'next-auth/providers/resend'; // Temporarily disabled - requires adapter
import bcrypt from 'bcrypt';
import { z } from 'zod';
import * as db from './db';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'MEMBER';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'ADMIN' | 'MEMBER';
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'MEMBER';
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/digital/auth/signin',
    signOut: '/digital/auth/signout',
    error: '/digital/auth/error',
    verifyRequest: '/digital/auth/verify-request',
  },
  providers: [
    // Email/Password
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const parsedCredentials = z
            .object({
              email: z.string().email(),
              password: z.string().min(8),
            })
            .safeParse(credentials);

          if (!parsedCredentials.success) {
            console.log('Invalid credentials format');
            return null;
          }

          const { email, password } = parsedCredentials.data;

          const user = await db.findUserByEmail(email);

          if (!user || !user.password) {
            console.log('User not found or no password set');
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            console.log('Password mismatch');
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
    // Magic link - Temporarily disabled (requires database adapter)
    // Resend({
    //   from: 'noreply@fermidas.com',
    //   apiKey: process.env.RESEND_API_KEY,
    // }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role as 'ADMIN' | 'MEMBER';
      }

      // Update session
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'MEMBER';
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Log user creation
      await db.createAuditLog({
        actorUserId: user.id,
        action: 'user.created',
        metaJson: JSON.stringify({
          email: user.email,
          provider: 'credentials',
        }),
      });
    },
  },
});

// Helper function to check if user is admin
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

// Helper to require authentication
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

// Helper to require admin
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  return session;
}
