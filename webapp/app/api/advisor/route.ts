import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
// AI advisor: grounds Claude in the signed-in user's own numbers (RLS-scoped reads).
export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { messages } = await req.json();
  const [{ data: accounts }, { data: tx }] = await Promise.all([
    sb.from('accounts').select('name,type,subtype,balance'),
    sb.from('transactions').select('date,name,amount,category').order('date', { ascending: false }).limit(150),
  ]);
  const system = `You are Net Worth's financial guide. Be concise, specific and kind. Use the user's data below; never invent numbers. You give education, not regulated investment advice.\nACCOUNTS:${JSON.stringify(accounts)}\nRECENT_TRANSACTIONS:${JSON.stringify(tx)}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 1024, system, messages: (messages ?? []).slice(-12) }),
  });
  const j = await r.json();
  if (!r.ok) return NextResponse.json({ error: j?.error?.message ?? 'advisor error' }, { status: 502 });
  return NextResponse.json({ reply: j.content?.map((c: any) => c.text ?? '').join('') ?? '' });
}
