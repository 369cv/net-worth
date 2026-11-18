import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wixClient, SITE_URL, OAUTH, TOKENS, cookieOpts } from '@/lib/wix-auth';
export async function GET(req: Request) {
  const url = new URL(req.url), code = url.searchParams.get('code'), state = url.searchParams.get('state');
  const stored = (await cookies()).get(OAUTH)?.value;
  if (!code || !state || !stored) return NextResponse.redirect(`${SITE_URL}/login?error=1`);
  const tokens = await wixClient().auth.getMemberTokens(code, state, JSON.parse(stored));
  const res = NextResponse.redirect(`${SITE_URL}/dashboard`);
  res.cookies.set(TOKENS, JSON.stringify(tokens), { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
  res.cookies.delete(OAUTH);
  return res;
}
