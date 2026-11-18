import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/wix-auth';
import { query } from '@/lib/wix-data';
// AI advisor grounded only in the signed-in member's own data.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { messages } = await req.json();
  const [accounts, tx, holdings] = await Promise.all([
    query('Accounts', user.id),
    query('Transactions', user.id, {}, [{ fieldName: 'date', order: 'DESC' }], 150),
    query('Holdings', user.id),
  ]);
  const pick = (r: any[], k: string[]) => r.map(x => Object.fromEntries(k.map(f => [f, x[f]])));
  const system = `You are Net Worth's financial advisor. Be concise, specific and kind. Use only the member's data below and never invent numbers; if data is missing, say what to link. You provide education, not regulated investment advice.
ACCOUNTS:${JSON.stringify(pick(accounts, ['name', 'type', 'subtype', 'balance']))}
TRANSACTIONS:${JSON.stringify(pick(tx, ['date', 'name', 'amount', 'category']))}
HOLDINGS:${JSON.stringify(pick(holdings, ['ticker', 'securityName', 'quantity', 'value']))}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 1024, system, messages: (messages ?? []).slice(-12) }),
  });
  const j = await r.json();
  if (!r.ok) return NextResponse.json({ error: j?.error?.message ?? 'The advisor is unavailable right now.' }, { status: 502 });
  return NextResponse.json({ reply: j.content?.map((c: any) => c.text ?? '').join('') ?? '' });
}
