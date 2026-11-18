import { NextResponse } from 'next/server';
import { CountryCode, Products } from 'plaid/legacy';
import { plaid } from '@/lib/plaid';
import { currentUser } from '@/lib/wix-auth';
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const r = await plaid.linkTokenCreate({
    user: { client_user_id: user.id }, client_name: 'Net Worth', language: 'en',
    products: [Products.Transactions], optional_products: [Products.Investments], country_codes: [CountryCode.Us],
  });
  return NextResponse.json({ link_token: r.data.link_token });
}
