'use client';
import { supabaseBrowser } from '@/lib/supabase';
export default function LogoutButton(){
  return <button className="text-sm underline" onClick={async ()=>{
    await supabaseBrowser().auth.signOut(); location.href='/';
  }}>Log out</button>;
}
