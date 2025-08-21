# Smart Layover — Next.js + Supabase + Stripe Starter

This is a **single-repo, single-deploy** starter for your paid Smart Layover app:
- Next.js (App Router)
- Supabase Auth (magic link) + `profiles` table
- Stripe subscriptions ($3.99/mo) with Checkout, Billing Portal, and Webhook
- Gated `/app` page where your UI lives

## 1) Setup

### A) Create Supabase project
1. Enable **Email** auth.
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service role key** → `SUPABASE_SERVICE_ROLE_KEY`
5. In SQL editor, run:
```sql
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  subscription_status text check (subscription_status in ('active','trialing','past_due','canceled','incomplete')),
  created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
create policy "Read own profile" on public.profiles for select using (auth.uid() = user_id);
```

### B) Create Stripe product
1. Product: **Smart Layover Pro**
2. Recurring price: **$3.99 / month**
3. Copy the **Price ID** → `STRIPE_PRICE_ID`

### C) Env vars
Copy `.env.example` to `.env.local` and fill in the values.

## 2) Run locally (or in GitHub Codespaces)
```bash
npm install
npm run dev
```

- Open http://localhost:3000 (or the forwarded Codespaces URL).

### Webhook (dev)
Install Stripe CLI and run:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Paste the printed secret as `STRIPE_WEBHOOK_SECRET` in `.env.local` and restart `npm run dev`.

## 3) Deploy (Vercel)
- Add all env vars in Vercel Project Settings (use your production URL for `NEXT_PUBLIC_SITE_URL`).
- In Stripe → Webhooks: add `https://YOUR-DOMAIN/api/stripe/webhook` and paste the new signing secret in Vercel.

## 4) Your app UI
Replace `app/app/smart-client.tsx` with your Smart Layover React component.

---

### Routes
- `/` — landing
- `/login` — magic link sign-in
- `/app` — gated app (requires active or trialing subscription)
- `/api/stripe/checkout` — creates Checkout session
- `/api/stripe/portal` — opens Billing Portal
- `/api/stripe/webhook` — updates `profiles.subscription_status`

Good luck and happy building!
