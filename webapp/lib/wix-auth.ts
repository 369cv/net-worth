import { createClient, OAuthStrategy } from '@wix/sdk';
import { members } from '@wix/members';
import { cookies } from 'next/headers';

export const WIX_CLIENT_ID = process.env.WIX_CLIENT_ID || '93d68ff8-1a94-4b42-a760-c0ea27b7bac5';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const TOKENS = 'nw_session';
export const OAUTH = 'nw_oauth';
export const cookieOpts = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' };

export const wixClient = (tokens?: any) =>
  createClient({ modules: { members }, auth: OAuthStrategy({ clientId: WIX_CLIENT_ID, ...(tokens ? { tokens } : {}) }) });

export type User = { id: string; email: string; name: string };

// Resolve the signed-in Wix member from the session cookie (server only).
export async function currentUser(): Promise<User | null> {
  const raw = (await cookies()).get(TOKENS)?.value;
  if (!raw) return null;
  try {
    const client = wixClient(JSON.parse(raw));
    const { member } = await client.members.getCurrentMember({ fieldsets: ['FULL'] as any });
    if (!member?._id) return null;
    return { id: member._id, email: member.loginEmail ?? '', name: member.profile?.nickname || member.contact?.firstName || '' };
  } catch { return null; }
}
