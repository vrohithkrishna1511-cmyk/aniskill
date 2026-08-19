import NextAuth from 'next-auth';
import { authOptions, getAuthBaseUrl } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const baseUrl = getAuthBaseUrl();
if (!process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL.includes('localhost'))) {
  process.env.NEXTAUTH_URL = baseUrl;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
