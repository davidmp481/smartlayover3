// lib/auth.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getServerUser() {
  // Pass Next.js cookies to the helper (App Router pattern)
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}
