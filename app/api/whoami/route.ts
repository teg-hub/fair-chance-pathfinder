import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  const email = req.headers.get('x-user-email') ?? '';
  const admin = supabaseAdmin();
  const r = await admin.rpc('set_session_from_email', { p_email: email });
  return NextResponse.json({ email, mapped: !r.error, error: r.error?.message ?? null });
}
