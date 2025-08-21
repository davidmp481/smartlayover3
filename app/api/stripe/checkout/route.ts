import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const { user_id, email } = await req.json();
  if (!user_id || !email) return NextResponse.json({ error: 'Missing user' }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: profile } = await admin.from('profiles').select('*').eq('user_id', user_id).maybeSingle();
  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { user_id } });
    customerId = customer.id;
    await admin.from('profiles').upsert({ user_id, stripe_customer_id: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app?sub=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app?sub=cancel`,
  });

  return NextResponse.json({ url: session.url });
}
