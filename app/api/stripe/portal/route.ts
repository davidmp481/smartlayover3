import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const { user_id } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'Missing user' }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: profile } = await admin.from('profiles').select('*').eq('user_id', user_id).maybeSingle();
  if (!profile?.stripe_customer_id) return NextResponse.json({ error: 'No customer' }, { status: 400 });

  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app`
  });

  return NextResponse.json({ url: portal.url });
}
