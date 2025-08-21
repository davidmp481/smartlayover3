import LogoutButton from '@/app/logout/button';
import SmartClient from './smart-client';
import { getServerUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

async function getProfile(user_id: string) {
  const admin = supabaseAdmin();
  const { data } = await admin.from('profiles')
    .select('subscription_status, stripe_customer_id')
    .eq('user_id', user_id)
    .maybeSingle();
  return data;
}

export default async function AppPage() {
  const { user } = await getServerUser();
  if (!user) return <div className="p-6">Please <a className="underline" href="/login">sign in</a>.</div>;

  const profile = await getProfile(user.id);
  const active = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>Welcome, {user.email}</div>
        <LogoutButton />
      </div>
      {active ? <SmartClient /> : <Paywall />}
    </main>
  );
}

function Paywall() {
  return (
    <div className="max-w-md p-6 border rounded bg-white">
      <h2 className="text-xl font-semibold mb-1">Smart Layover Pro</h2>
      <p className="text-gray-600 mb-4">$3.99 / month</p>
      <SubscribeButtons />
    </div>
  );
}

function SubscribeButtons() {
  async function post(route: 'checkout'|'portal') {
    const me = await fetch('/api/me'); if (!me.ok) { location.href='/login'; return; }
    const { user_id, email } = await me.json();
    const r = await fetch(`/api/stripe/${route}`, { method: 'POST', body: JSON.stringify({ user_id, email }) });
    const { url, error } = await r.json();
    if (error) alert(error); else location.href = url;
  }
  return (
    <div className="flex gap-2">
      <button className="px-4 py-2 bg-black text-white rounded" onClick={()=>post('checkout')}>Subscribe</button>
      <button className="px-4 py-2 border rounded" onClick={()=>post('portal')}>Manage billing</button>
    </div>
  );
}
