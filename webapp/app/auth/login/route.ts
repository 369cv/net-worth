import { NextResponse } from 'next/server';
import { wixClient, SITE_URL, OAUTH, cookieOpts } from '@/lib/wix-auth';
// Starts Wix member login (OAuth + PKCE). Wix hosts the sign-in / sign-up page.
export async function GET() {
  const client = wixClient();
  const data = client.auth.generateOAuthData(`${SITE_URL}/auth/callback`, `${SITE_URL}/dashboard`);
  const { authUrl } = await client.auth.getAuthUrl(data, { responseMode: 'query' });
  const res = NextResponse.redirect(authUrl);
  res.cookies.set(OAUTH, JSON.stringify(data), { ...cookieOpts, maxAge: 600 });
  return res;
}
