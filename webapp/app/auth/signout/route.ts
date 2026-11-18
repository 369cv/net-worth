import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wixClient, SITE_URL, TOKENS } from '@/lib/wix-auth';
export async function POST() {
  const raw = (await cookies()).get(TOKENS)?.value;
  let to = `${SITE_URL}/login`;
  try { if (raw) to = (await wixClient(JSON.parse(raw)).auth.logout(to)).logoutUrl; } catch {}
  const res = NextResponse.redirect(to, 303);
  res.cookies.delete(TOKENS);
  return res;
}
