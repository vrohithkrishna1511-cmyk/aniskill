import NextAuth from 'next-auth';
import { authOptions, getAuthBaseUrl } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const handler = async (req: NextRequest, ctx: any) => {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || (host && !host.includes('localhost') ? 'https' : 'http');

  if (host && !host.includes('localhost')) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  } else if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = getAuthBaseUrl();
  }

  return NextAuth(authOptions)(req as any, ctx as any);
};

export { handler as GET, handler as POST };
