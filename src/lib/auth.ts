import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

export function getAuthBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL.includes('localhost')) {
      if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
      }
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
      }
      return 'https://aniskill-qt1g.vercel.app';
    }
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://aniskill-qt1g.vercel.app';
  }
  return 'http://localhost:3000';
}

const authBaseUrl = getAuthBaseUrl();
if (!process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL.includes('localhost'))) {
  process.env.NEXTAUTH_URL = authBaseUrl;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignUp: { label: 'isSignUp', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email.toLowerCase().trim();
        const name = credentials.name?.trim() || '';

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
              shinobiName: name,
              nickname: null,
              rank: 'NINJA_STUDENT',
              chakra: 0,
              totalXp: 0,
              dailyAvailableMinutes: 0,
            },
          });
        } else if (credentials.isSignUp === 'true' && credentials.name) {
          user = await prisma.user.update({
            where: { email },
            data: {
              name,
              shinobiName: name,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.shinobiName || user.name,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const currentBaseUrl = getAuthBaseUrl();
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${currentBaseUrl}${url}`;
      // Allows callback URLs on the same origin
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === currentBaseUrl || parsedUrl.origin === baseUrl) {
          return url;
        }
      } catch {
        // invalid URL string, fallback
      }
      return `${currentBaseUrl}/dashboard`;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        const email = user.email.toLowerCase().trim();
        const googleId = account?.providerAccountId || user.id;
        const profileName = (profile as any)?.name || user.name || '';
        const avatarUrl = user.image || (profile as any)?.picture || undefined;

        // Upsert user in database cleanly
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
          await prisma.user.update({
            where: { email },
            data: {
              googleId,
              ...(avatarUrl ? { avatarUrl } : {}),
              name: existingUser.name ? existingUser.name : profileName,
              shinobiName: existingUser.shinobiName ? existingUser.shinobiName : profileName,
            },
          });
        } else {
          await prisma.user.create({
            data: {
              email,
              googleId,
              name: profileName,
              shinobiName: profileName,
              avatarUrl,
              rank: 'NINJA_STUDENT',
              chakra: 0,
              totalXp: 0,
              dailyAvailableMinutes: 0,
            },
          });
        }
      } catch (err) {
        console.error('Error upserting Google OAuth user in DB:', err);
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          const email = session.user.email.toLowerCase().trim();
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            (session.user as any).id = dbUser.id;
            (session.user as any).shinobiName = dbUser.shinobiName || dbUser.name || session.user.name;
            (session.user as any).rank = dbUser.rank;
            (session.user as any).avatarUrl = dbUser.avatarUrl || session.user.image;
            session.user.name = dbUser.name || dbUser.shinobiName || session.user.name || 'Shinobi Learner';
          }
        } catch (err) {
          console.error('Error attaching dbUser to session:', err);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'aniskill-shinobi-secret-key-2026',
};

export const getAuthSession = () => getServerSession(authOptions);
