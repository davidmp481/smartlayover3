import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const rawBody = await req.text(); // IMPORTANT: raw text

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const admin = supabaseAdmin();

  if (event.type === 'checkout.session.completed') {
    const cs = event.data.object as Stripe.Checkout.Session;
    const customerId = cs.customer as string | null;
    const subId = cs.subscription as string | null;

    if (customerId) {
      const cust = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const user_id = (cust.metadata as any)?.user_id;
      let status = 'active';
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        status = sub.status;
      }
      if (user_id) {
        await admin.from('profiles').upsert({
          user_id,
          stripe_customer_id: customerId,
          subscription_status: status
        });
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const status = sub.status;
    const { data: profile } = await admin.from('profiles').select('user_id')
      .eq('stripe_customer_id', customerId).maybeSingle();
    if (profile?.user_id) {
      await admin.from('profiles').update({ subscription_status: status }).eq('user_id', profile.user_id);
    }
  }

  return NextResponse.json({ received: true });
}
