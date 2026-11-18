import { NextResponse, type NextRequest } from 'next/server';
export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname, signedIn = req.cookies.has('nw_session');
  const isPublic = p === '/login' || p.startsWith('/auth');
  if (!signedIn && !isPublic) return p.startsWith('/api') ? NextResponse.json({ error: 'unauthorized' }, { status: 401 }) : NextResponse.redirect(new URL('/login', req.url));
  if (signedIn && p === '/login') return NextResponse.redirect(new URL('/dashboard', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next|favicon|brand|.*\\.(?:svg|png|jpg|ico)).*)'] };
