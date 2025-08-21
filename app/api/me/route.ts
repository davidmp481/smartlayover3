import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';

export async function GET() {
  const { user } = await getServerUser();
  if (!user) return NextResponse.json({ error: 'not authed' }, { status: 401 });
  return NextResponse.json({ user_id: user.id, email: user.email });
}
