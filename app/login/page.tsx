'use client';
import { supabaseBrowser } from '@/lib/supabase';
import { useState } from 'react';

export default function Login() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState('');

  async function signIn() {
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/app` }
    });
    if (error) alert(error.message);
    else alert('Check your email for the magic link.');
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <input className="border px-3 py-2 w-full mb-2" placeholder="you@example.com"
             value={email} onChange={e=>setEmail(e.target.value)} />
      <button className="px-4 py-2 bg-black text-white rounded" onClick={signIn}>Send magic link</button>
    </main>
  );
}
